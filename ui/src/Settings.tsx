import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Autocomplete, Button, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { GefyraUpRequest } from "gefyra/lib/protocol";

import { DockerImage, statusMap } from "./types";
import { Kubectl } from "./utils/kubectl";
import { Gefyra } from "./gefyraClient";
import { GefyraStatus } from "./types";
import { resetSteps, setActiveStep, setMode, setView } from "./store/ui";
import { setContext, setKubeconfig, setNamespace, setImage } from "./store/gefyra";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";

const ddClient = createDockerDesktopClient();
const loading = 'Loading...';
const kubectl = new Kubectl(ddClient);

export function Settings() {
    const dispatch = useDispatch()
    const selectContext = 'Select context first';
    const loading = 'Loading...'
    const [availableContexts, setAvailableContexts] = useState([]);
    const [status, setStatus] = useState({});
    
    const [images, setImages] = React.useState<DockerImage[]>([]);
    const ddClient = createDockerDesktopClient();
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
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const kubeconfig = useAppSelector(state => state.gefyra.kubeconfig)
    const context = useAppSelector(state => state.gefyra.context)

    const gefyraClient = new Gefyra(ddClient);

    function gefyraTest()  {
	let upRequest = new GefyraUpRequest();
	gefyraClient.exec(upRequest).then(res => console.log(res))
    }

    function loadContexts() {
        setAvailableContexts([loading])
        kubectl.getContexts(kubeconfig).then((contexts) => {
            if (!contexts.error) {
                setAvailableContexts(['No context selected'].concat(contexts.value))
            } else {
                setStatus(statusMap[4])
            }
        })
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
        }

    };

    async function handleImageChange (e, b) {
	dispatch(setImage(e.target.value))
    }

    async function handleContextChange (e, b) {
        dispatch(setContext(e.target.value))
        setStatus(statusMap[5])
        kubectl.getNamespaces(e.target.value, kubeconfig).then((namespaces) => {
            const select = 'Select a namespace'
            setStatus(statusMap[2])
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


    // loadContexts()

    
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
                <Select labelId="context-select-label" id="context-select" value={context} label="Context"
                    onChange={handleContextChange} sx={{minWidth: 300}}>
                    {availableContexts.map((name, index) => (
                        <MenuItem key={name} value={name} disabled={index === 0}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
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
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={gefyraTest}
                    sx={{ marginTop: 1 }}
                >
		 Gefyra Up
		</Button>
            </Grid>
        </>
    )
}
