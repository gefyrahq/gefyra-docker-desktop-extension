import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Button, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { statusMap } from "./types";
import { Kubectl } from "./utils/kubectl";
import { GefyraStatus } from "./types";
import { resetSteps, setMode, setView } from "./store/ui";
import { setContext, setKubeconfig, setNamespace } from "./store/gefyra";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";

const ddClient = createDockerDesktopClient();
const loading = 'Loading...';
const kubectl = new Kubectl(ddClient);

export function Settings() {
    const dispatch = useDispatch()
    const selectContext = 'Select context first';
    const loading = 'Loading...'
    const [availableNamespaces, setAvailableNamespaces] = useState([]);
    const [availableContexts, setAvailableContexts] = useState([]);
    const [namespaceInputActive, setNamespaceInputActive] = useState(false);
    const [status, setStatus] = useState({});

    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const kubeconfig = useAppSelector(state => state.gefyra.kubeconfig)
    const context = useAppSelector(state => state.gefyra.context)
    const namespace = useAppSelector(state => state.gefyra.namespace)

    function loadContexts() {
        setAvailableNamespaces([selectContext])
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

    async function handleContextChange (e, b) {

        dispatch(setContext(e.target.value))
        setAvailableNamespaces([loading])
        setStatus(statusMap[5])
        kubectl.getNamespaces(e.target.value, kubeconfig).then((namespaces) => {
            const select = 'Select a namespace'
            setAvailableNamespaces([select].concat(namespaces))
            setNamespaceInputActive(true)
            setStatus(statusMap[2])
        })
    }

    function back() {
        dispatch(setMode(''))
        dispatch(setView('mode'))
        dispatch(resetSteps())
    }

    async function handleNamespaceChange (e, b) {
        await dispatch(setNamespace(e.target.value))
    }

    // loadContexts()

    
    return (
        <>
            <Grid item xs={12} alignItems="center">
                <Typography variant="subtitle1">
                    Please set Kubernetes configuration.
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <InputLabel sx={{ mb: 1 }} id="kubeconfig-label">Kubeconfig</InputLabel>
                <TextField id="kubeconfig" variant="outlined" fullWidth InputProps={{ readOnly: true }} value={kubeconfig}
                onClick={handleKubeConfigChange}/>
            </Grid>
            <Grid item xs={6}>
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
            <Grid item xs={6}>
                <InputLabel sx={{ mb: 1, mt: 2 }} id="context-select-label">Context</InputLabel>
                <Select labelId="context-select-label" id="context-select" value={context} label="Context"
                    onChange={handleContextChange} sx={{minWidth: 200}}>
                    {availableContexts.map((name, index) => (
                        <MenuItem key={name} value={name} disabled={index === 0}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
                <InputLabel sx={{ mb: 1, mt: 2 }} id="namespace-select-label">Namespace</InputLabel>
                <Select labelId="namespace-select-label" id="namespace-select" value={namespace} label="Namespace"
                    onChange={handleNamespaceChange} disabled={!namespaceInputActive} sx={{minWidth: 200}}>
                    {namespaceInputActive ? availableNamespaces.map((name, index) => (
                        <MenuItem key={name} value={name} divider={index === 0} disabled={index === 0}>
                            {name}
                        </MenuItem>
                    )) : <MenuItem selected={true} value={null}>Please select a valid context.</MenuItem>}
                </Select>
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
            </Grid>
        </>
    )
}
