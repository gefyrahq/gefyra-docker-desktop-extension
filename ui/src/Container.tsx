import { Button, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { EnvironmentVariables } from "./EnvironmentVariables";
import { VolumeMounts } from "./VolumeMounts";
import { RootState } from "./store";
import { setNamespace } from "./store/gefyra";
import { setActiveStep, setView } from "./store/ui";


export function Container() {
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const [availableNamespaces, setAvailableNamespaces] = useState([]);
    const [namespaceInputActive, setNamespaceInputActive] = useState(false);
    const namespace = useAppSelector(state => state.gefyra.namespace)

    
    const dispatch = useDispatch()
    function back() {
        dispatch(setView('settings'))
        dispatch(setActiveStep(1))
    }
    function next() {}


    async function handleNamespaceChange (e, b) {
        await dispatch(setNamespace(e.target.value))
    }

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
        <Grid item xs={7}>
            <InputLabel sx={{ mb: 1, mt: 2 }} id="namespace-select-label">Environment</InputLabel>
            <Select labelId="namespace-select-label" id="namespace-select" value={namespace} label="Environment"
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
                onClick={next}
                sx={{ marginTop: 1, ml: 2 }}
            >
                Run
            </Button>
        </Grid>
        </>
    )
}
