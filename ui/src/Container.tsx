import { Button, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { EnvironmentVariables } from "./EnvironmentVariables";
import { VolumeMounts } from "./VolumeMounts";
import store, { RootState } from "./store";
import gefyra, { setNamespace } from "./store/gefyra";
import { GefyraRunRequest, GefyraStatusRequest, GefyraUpRequest, K8sNamespaceRequest } from "gefyra/lib/protocol";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Gefyra } from "./gefyraClient";
import useNavigation from "./composable/navigation";
import { LSelect } from "./components/LSelect";
import { GefyraStatusBar } from "./components/GefyraStatusBar";
import { EnvironmentVariable } from "./types";



export function Container() {
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const [availableNamespaces, setAvailableNamespaces] = useState([]);
    const [namespaceInputActive, setNamespaceInputActive] = useState(false);
    const [runLabel, setRunLabel] = useState("");
    const [runProgress, setRunProgress] = useState(0);
    const [runError, setRunError] = useState(false);

    const namespace = useAppSelector(state => state.gefyra.namespace)
    const environmentVariables = useAppSelector(state => state.gefyra.environmentVariables)
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

    async function run() {
        setRunError(false);
        const gefyraClient = new Gefyra(ddClient);

        let kubeconfig = store.getState().gefyra.kubeconfig
        let context = store.getState().gefyra.context

        setRunLabel("Checking cluster for existing Gefyra installation.")

        let image = store.getState().gefyra.image
        let namespace = store.getState().gefyra.namespace
        const upRequest = new GefyraUpRequest();
        upRequest.kubeconfig = kubeconfig;
        upRequest.context = context;

        const runRequest = new GefyraRunRequest();
        runRequest.image = image;
        runRequest.command = "sleep 300"
        runRequest.namespace = namespace
        console.log(environmentVariables)
        runRequest.env = environmentVariables.map((item: EnvironmentVariable) => `${item.label}=${item.value}`);

        const statusRequest = new GefyraStatusRequest()

        await gefyraClient.exec(statusRequest).then(async (res) => {
            const response = JSON.parse(res).response;
            const cluster = response.cluster;
            const client = response.client;
            if (!cluster.connected) {
                displayError("Cluster connection not available.")
                return;
            }
            updateProgress("Cluster connection confirmed.", 5)
            if (!cluster.operator) {
                updateProgress("Gefyra Operator not found. Installing now.")
                const res = await gefyraClient.exec(upRequest).then((res) => {
                    const response = JSON.parse(res)
                    return response.status === "success"
                })
                if (!res) {
                    displayError("Could not install Gefyra")
                }
            } else {
                updateProgress("Gefyra Operator confirmed.", 15)
            }
            if (!cluster.stowaway) {
                displayError("Could not confirm Stowaway - fatal error.")
                return;
            }
            updateProgress("Gefyra Stowaway confirmed.", 20)
            if (!client.cargo) {
                displayError("Gefyra Cargo not running.")
                return;
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

        })

        // gefyraClient.exec(upRequest).then(res => {
        //     console.log(res);
        //     gefyraClient.exec(runRequest).then(res => {
        //         console.log(res)
        //     })
        // })

        // next()


        // let volumes = store.getState().gefyra.volumes
        // let namespace = store.getState().gefyra.namespace

    }


    function initNamespaces() {
        let nsRequest = new K8sNamespaceRequest();
        nsRequest.kubeconfig = store.getState().gefyra.kubeconfig;
        nsRequest.context = store.getState().gefyra.context;
        gefyraClient.exec(nsRequest).then(res => {
            let parsed = JSON.parse(res);
            const namespaces = parsed.response.namespaces;
            setNamespaceInputActive(true);
            setAvailableNamespaces([{label: 'Select a namespace', value: 'select'}].concat(namespaces.map(n => ({label: n, value: n}))));
            if (!namespace) {
                dispatch(setNamespace('select'))
            }
        })
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
                <InputLabel sx={{ mb: 1, mt: 2 }} id="namespace-select-label">Namespace</InputLabel>
                <LSelect labelId="namespace-select-label" id="namespace-select" value={namespace} label="Namespace"
                    handleChange={handleNamespaceChange} disabled={!namespaceInputActive} loading={!namespaceInputActive} items={availableNamespaces}/>
                
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
