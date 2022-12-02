import { Button, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { EnvironmentVariables } from "./EnvironmentVariables";
import { VolumeMounts } from "./VolumeMounts";
import store, { RootState } from "./store";
import { setNamespace } from "./store/gefyra";
import { setActiveStep, setView } from "./store/ui";
import { GefyraRunRequest, GefyraUpRequest, K8sNamespaceRequest } from "gefyra/lib/protocol";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Gefyra } from "./gefyraClient";


export function Container() {
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const [availableNamespaces, setAvailableNamespaces] = useState([]);
    const [namespaceInputActive, setNamespaceInputActive] = useState(false);
    const namespace = useAppSelector(state => state.gefyra.namespace)
    const ddClient = createDockerDesktopClient();

    
    const dispatch = useDispatch()
    const gefyraClient = new Gefyra(ddClient);

    function back() {
        dispatch(setView('settings'))
        dispatch(setActiveStep(1))
    }
    function next() {}

    function run() {
	const gefyraClient = new Gefyra(ddClient);

	let kubeconfig = store.getState().gefyra.kubeconfig
	let context = store.getState().gefyra.context
	
	
	let image = store.getState().gefyra.image
	let namespace = store.getState().gefyra.namespace
	let upRequest = new GefyraUpRequest();
	upRequest.kubeconfig = kubeconfig;
	upRequest.context = context;

	let runRequest = new GefyraRunRequest();
	runRequest.image = image;

	gefyraClient.exec(upRequest).then(res => {
		console.log(res);
		gefyraClient.exec(runRequest).then(res  => {
			console.log(res)
		})
	})

	
	// let volumes = store.getState().gefyra.volumes
	// let namespace = store.getState().gefyra.namespace

    }


    function initNamespaces () {
	let nsRequest = new K8sNamespaceRequest();
	nsRequest.kubeconfig = store.getState().gefyra.kubeconfig;
	nsRequest.context = store.getState().gefyra.context;
	gefyraClient.exec(nsRequest).then(res => {
	    let parsed = JSON.parse(res);
	    setAvailableNamespaces(parsed.response.namespaces);
	    setNamespaceInputActive(true);
	})
    }

    async function handleNamespaceChange (e, b) {
        await dispatch(setNamespace(e.target.value))
    }

    useEffect(() => {
    	initNamespaces();
    },[])

    return (
        <>
        <Grid item xs={12} alignItems="center">
            <Typography variant="subtitle1">
                Configure your container.
            </Typography>
        </Grid>
        <Grid item xs={5}>
            <InputLabel sx={{ mb: 1, mt: 2 }} id="namespace-select-label">Namespace</InputLabel>
            <Select labelId="namespace-select-label" id="namespace-select" value={namespace} label="Namespace"
                onChange={handleNamespaceChange} disabled={!namespaceInputActive} sx={{minWidth: 400}}>
                {namespaceInputActive ? availableNamespaces.map((name, index) => (
                    <MenuItem key={name} value={name} divider={index === 0} disabled={index === 0}>
                        {name}
                    </MenuItem>
                )) : <MenuItem selected={true} value={null}>Please select a valid context.</MenuItem>}
            </Select>
        </Grid>
        <EnvironmentVariables />
        <VolumeMounts></VolumeMounts>
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
