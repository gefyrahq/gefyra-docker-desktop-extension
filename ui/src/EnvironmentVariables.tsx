import { Button, Grid, InputLabel, TextField } from "@mui/material"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { RootState } from "./store"
import { addEnvironmentVariable, removeEnvironmentVariable } from "./store/gefyra"


export function EnvironmentVariables() {

    const dispatch = useDispatch()
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const variables = useAppSelector(state => state.gefyra.environmentVariables)

    function addVariable() {
        dispatch(addEnvironmentVariable({label: '', value: ''}))
        console.log(variables)
    }

    return (
        <>
            <Grid item xs={12}>
                Environment Variables
            </Grid>
            {variables.map((v, index) => 
                ( v ?
                <Grid item xs={12} key={index}>
                    <Grid container spacing={4}>
                        <Grid item xs={5}>
                            <InputLabel sx={{ mb: 1 }} id="variable-label">Name</InputLabel>
                            <TextField id={'variableLabel' + index} variant="outlined" fullWidth size="small"/>
                        </Grid>
                        <Grid item xs={5}>
                            <InputLabel sx={{ mb: 1 }} id="value-label">Value</InputLabel>
                            <TextField id={'variableValue' + index} variant="outlined" fullWidth size="small"/>
                        </Grid>
                        <Grid item xs={2}>
                            <Button variant="contained" color="error" sx={{mt: 4}} onClick={() => dispatch(removeEnvironmentVariable(index))}>X</Button>
                        </Grid>
                    </Grid>
                </Grid>
                : '')
            )}
            <Grid item xs={12}>
                <Button
                variant="contained"
                component="label"
                color="primary"
                onClick={addVariable}
                >+</Button>
            </Grid>
        </>
    )
}