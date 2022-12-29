import { Button, Grid, InputLabel, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { EnvironmentVariables } from "./EnvironmentVariables";
import { VolumeMounts } from "./VolumeMounts";
import store, { RootState } from "./store";
import gefyra, { setNamespace, setContainerName, setCommand } from "./store/gefyra";
import { GefyraRunRequest, GefyraStatusRequest, GefyraUpRequest, K8sNamespaceRequest } from "gefyra/lib/protocol";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Gefyra } from "./gefyraClient";
import useNavigation from "./composable/navigation";
import { LSelect } from "./components/LSelect";
import { GefyraStatusBar } from "./components/GefyraStatusBar";
import { EnvironmentVariable } from "./types";
import { checkCargoReady, checkStowawayReady, gefyraUp } from "./utils/gefyra";


export function Container() {
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const [namespaceInputActive, setNamespaceInputActive] = useState(false);
    const [selectNamespaces, setSelectNamespaces] = useState([]);
    const [runLabel, setRunLabel] = useState("");
    const [runProgress, setRunProgress] = useState(0);
    const [runError, setRunError] = useState(false);

    const namespace = useAppSelector(state => state.gefyra.namespace)
    const availableNamespaces = useAppSelector(state => state.gefyra.availableNamespaces)
    const command = useAppSelector(state => state.gefyra.command)
    const environmentVariables = useAppSelector(state => state.gefyra.environmentVariables)
    const kubeconfig = useAppSelector(state => state.gefyra.kubeconfig)
    const context = useAppSelector(state => state.gefyra.context)
    const image = useAppSelector(state => state.gefyra.image)
    const volumeMounts = useAppSelector(state => state.gefyra.volumeMounts)
    // TODO check if container is already running on startup
    const containerName = useAppSelector(state => state.gefyra.containerName)
    const ddClient = createDockerDesktopClient();


    const dispatch = useDispatch()
    const gefyraClient = new Gefyra(ddClient);

    const [back, next] = useNavigation(
        { resetMode: false, step: 1, view: 'settings' },
        { resetMode: false, step: 3, view: 'run' },
    )

    function updateProgress(msg: string, progress?: number, error: boolean = false) {
        setRunLabel(msg);
        if (progress) {
            setRunProgress(progress)
        }
        setRunError(error);
    }


    function displayError(msg: string) {
        updateProgress(msg, null, true)        
    }

    const handleCommandChange = (e) => {
        dispatch(setCommand(e.target.value))
    }

    async function run() {
        updateProgress("", 0, false)
        const gefyraClient = new Gefyra(ddClient);


        setRunLabel("Checking cluster for existing Gefyra installation.")
        const upRequest = new GefyraUpRequest();
        upRequest.kubeconfig = kubeconfig;
        upRequest.context = context;

        const runRequest = new GefyraRunRequest();
        const containerName = `gefyra-${(Math.random() + 1).toString(36).substring(7)}`;
        runRequest.image = image;
        runRequest.command = command
        runRequest.namespace = namespace
        runRequest.name = containerName
        dispatch(setContainerName(containerName))
        runRequest.env = environmentVariables.map((item: EnvironmentVariable) => `${item.label}=${item.value}`);
        // TODO fix volumes - seems typing is wrong
        runRequest.volumes = volumeMounts.map(item => `${item.host}:${item.container}`);

        const statusRequest = new GefyraStatusRequest()

        await gefyraClient.exec(statusRequest).then(async (res) => {
            const response = JSON.parse(res).response;
            let cluster = response.cluster;
            let client = response.client;
            if (!cluster.connected) {
                displayError("Cluster connection not available.")
                return;
            }
            updateProgress("Cluster connection confirmed.", 5)
            if (!cluster.operator) {
                updateProgress("Gefyra Operator not found. Installing now.")
                const res = await gefyraUp(gefyraClient, upRequest)
                if (!res) {
                    displayError("Could not install Gefyra")
                    return;
                }
            } else {
                updateProgress("Gefyra Operator confirmed.", 15)
            }
            updateProgress("Waiting for stowaway to become ready.", 15)
            cluster = await checkStowawayReady(gefyraClient, 10).catch(err => false)
            // cycles stowaway retry
            if (!cluster.stowaway) {
                displayError("Could not confirm Stowaway - fatal error.")
                return;
            }
            updateProgress("Gefyra Stowaway confirmed.", 25)
            if (!client.cargo) {
                updateProgress("Cargo not found - starting Cargo now...", 27)
                await gefyraUp(gefyraClient, upRequest)
                client = await checkCargoReady(gefyraClient, 10).catch(err => false)
                if (!client.cargo) {
                    displayError("Gefyra Cargo not running.")
                    return;
                }
            }
            updateProgress("Gefyra Cargo confirmed.", 30)   
            if (!client.network) {
                displayError("Gefyra network missing.")
                return;
            }
            updateProgress("Gefyra Network confirmed.", 50)
            if (!client.connection) {
                displayError("Gefyra Cargo connection not working.")
                return;
            }
            updateProgress("Gefyra Cargo connection confirmed.", 60)

            updateProgress("Starting local container.", 70)
            console.log(runRequest)
            const runResult = await gefyraClient.exec(runRequest).then(async res => {
                const result = JSON.parse(res)
                console.log(result) 
                return result.status === "success"
            })
            if (!runResult) {
                displayError("Could not run container")
                return;
            }
            updateProgress("Container is running!", 100)
            next()
        }).catch(err => {
            console.log(err)
        })
    }


    function initNamespaces() {
        setNamespaceInputActive(true);
        setSelectNamespaces([{label: 'Select a namespace', value: 'select'}].concat(availableNamespaces.map(n => ({label: n, value: n}))));
        if (!namespace) {
            dispatch(setNamespace('select'))
        }   
    }

    function handleNamespaceChange(e, b): any {
        dispatch(setNamespace(e.target.value))
    }

    useEffect(() => {
        initNamespaces();
    }, [])

    return (
        <>
            <Grid item xs={12} alignItems="center">
                <Typography variant="subtitle1">
                    Configure your container.
                </Typography>
            </Grid>
            <Grid item xs={5}>
                <InputLabel sx={{ mb: 1 }} id="namespace-select-label">Namespace</InputLabel>
                <LSelect labelId="namespace-select-label" id="namespace-select" value={namespace} label="Namespace"
                    handleChange={handleNamespaceChange} disabled={!namespaceInputActive} loading={!namespaceInputActive} items={selectNamespaces}/>
            </Grid>

            <Grid item xs={7}>
                <InputLabel sx={{ mb: 1 }} id="command-label">Command (Overwrite)</InputLabel>
                <TextField id="command" variant="outlined" fullWidth value={command}
                    onInput={handleCommandChange} />
            </Grid>
            <EnvironmentVariables />
            <VolumeMounts></VolumeMounts>

            <Grid item xs={12}>
                <GefyraStatusBar label={runLabel} progress={runProgress} error={runError}/>
            </Grid>

            <Grid item xs={12}>
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={back}
                    sx={{ marginTop: 1 }}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={run}
                    sx={{ marginTop: 1, ml: 2 }}
                >
                    Run
                </Button>
            </Grid>
        </>
    )
}
