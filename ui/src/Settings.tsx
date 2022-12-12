import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Autocomplete, Button, CircularProgress, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { GefyraStatusRequest, GefyraUpRequest, K8sContextRequest, K8sContextResponse, K8sNamespaceRequest } from "gefyra/lib/protocol";

import { DockerImage, statusMap } from "./types";
import { Kubectl } from "./utils/kubectl";
import { Gefyra } from "./gefyraClient";
import { GefyraStatus } from "./types";
import { resetSteps, setActiveStep, setMode, setView } from "./store/ui";
import { setContext, setKubeconfig, setNamespace, setImage } from "./store/gefyra";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import store, { RootState } from "./store";
import { LSelect } from "./components/LSelect";

const ddClient = createDockerDesktopClient();
const loading = 'Loading...';
const selectContext = 'Please select a context';

const kubectl = new Kubectl(ddClient);

export function Settings() {
    const dispatch = useDispatch()
    const [availableContexts, setAvailableContexts] = useState([]);
    const [status, setStatus] = useState({});
    const [contextLoading, setContextLoading] = useState<boolean>(false);
    
    const [images, setImages] = useState<DockerImage[]>([]);
    const ddClient = createDockerDesktopClient();
    useEffect(() => {
	    ddClient.docker.listImages().then((res: any) => {
		if (!res) return;
		// console.log(res)
		const images = []
		res.map(i => {
		    const image: DockerImage = {}
		    if (i.RepoTags) {
			image.repo = i.RepoTags[0].split(":")[0];
			image.tag = i.RepoTags[0].split(":")[1];
			image.created = i.Created
		    }
		    else {
			return
		    }
		    if (image.repo !== '<none>') {
			image.id = i.Id
			image.type = 'local'
			images.push(image);
		    }

		})
		setImages(images);
	    });

    }, []);
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const kubeconfig = useAppSelector(state => state.gefyra.kubeconfig)
    const context = useAppSelector(state => state.gefyra.context)

    const gefyraClient = new Gefyra(ddClient);

    function loadContexts() {
        setContextLoading(true)
        console.log("I'm loading contexts, please stand by");
        let contextRequest = new K8sContextRequest();
        contextRequest.kubeconfig = store.getState().gefyra.kubeconfig;
	
    	gefyraClient.exec(contextRequest).then(res => {
	    let parsed: K8sContextResponse = JSON.parse(res);
	    const contexts = parsed.response.contexts;
        const contextItems = contexts.map(c => { return {label: c, value: c}});
        if (contexts.length === 1) {
	        setAvailableContexts(contextItems);
            dispatch(setContext(contexts[0]))
        } else {
            dispatch(setContext(selectContext))
            setAvailableContexts([{label: selectContext, value: selectContext}].concat(contextItems));
        }
        setContextLoading(false)
	}).catch(err => console.error(err));
    }

    async function handleKubeConfigChange (e) {
        const result = await ddClient.desktopUI.dialog.showOpenDialog({
            filters: [{
                extensions: ['yaml', 'yml']
            }],
            properties: ["openFile"],
        });
        if (!result.canceled) {
          const directory = result.filePaths.shift();
          if (directory !== undefined) {
              dispatch(setKubeconfig(directory))
          }
	  loadContexts();
        }

    };

    async function handleImageChange (e, b) {
	dispatch(setImage(e.target.value))
    }

    async function handleContextChange (e, b) {
        dispatch(setContext(e.target.value))
        setStatus(statusMap[5])
        let nsRequest = new K8sNamespaceRequest();
        nsRequest.kubeconfig = store.getState().gefyra.kubeconfig;
        nsRequest.context = store.getState().gefyra.context;
        gefyraClient.exec(nsRequest).then(res => {
            console.log(res);
            const select = "Select a namespace";
            setStatus(statusMap[2]);
        })
    }

    function back() {
        dispatch(setMode(''))
        dispatch(setView('mode'))
        dispatch(resetSteps())
    }

    function next() {
        dispatch(setView('container'))
        dispatch(setActiveStep(2))
    }

    return (
        <>
            <Grid item xs={12} alignItems="center">
                <Typography variant="subtitle1">
                    Please set Kubernetes configuration.
                </Typography>
            </Grid>
            <Grid item xs={5}>
                <InputLabel sx={{ mb: 1 }} id="kubeconfig-label">Kubeconfig</InputLabel>
                <TextField id="kubeconfig" variant="outlined" fullWidth InputProps={{ readOnly: true }} value={kubeconfig}
                onClick={handleKubeConfigChange}/>
            </Grid>
            <Grid item xs={2}>
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={handleKubeConfigChange}
                    sx={{ marginTop: '37px', ml: -1 }}
                >
                    Choose Kubeconfig
                </Button>
            </Grid>
            <Grid item xs={4}>
                <InputLabel sx={{ mb: 1 }} id="context-select-label">Context</InputLabel>
                <LSelect disabled={contextLoading} loading={contextLoading} value={context} label={"Context"} items={availableContexts} id={"context-input"} labelId={"context-select-label"} handleChange={handleContextChange}></LSelect>
            </Grid>
            <Grid item xs={12}>
            <Autocomplete
                id="grouped-images"
                options={images.sort((a, b) => -b.repo[0].localeCompare(a.repo[0]))}
                groupBy={(image) => image.type}
                getOptionLabel={(image: DockerImage) => `${image.repo}:${image.tag}`}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Select image" />}
                />
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
                    onClick={next}
                    sx={{ marginTop: 1, ml: 2 }}
                >
                    Next
                </Button>
            </Grid>
        </>
    )
}
