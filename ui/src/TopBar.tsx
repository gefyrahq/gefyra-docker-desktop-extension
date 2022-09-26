import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Button, Grid, Typography, Stepper, Step, StepButton, StepLabel } from "@mui/material";
import { MouseEventHandler } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { setMode, setView, resetSteps } from "./store/ui";


export function TopBar() {
    const docker = createDockerDesktopClient();
    function githubLink(e) {
        docker.host.openExternal("https://github.com/gefyrahq/gefyra");
    }
    const dispatch = useDispatch()      

    function handleStepClick(index) {
        if (index === 0) {
            dispatch(setMode(''))  
            dispatch(setView('mode'))  
            dispatch(resetSteps())
        }
    }

    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const steps = useAppSelector(state => state.ui.steps)
    const activeStep = useAppSelector(state => state.ui.activeStep)
    return (
        <>
            <Grid item xs={8}>
                <img src="/assets/gefyra_horizontal.svg" width="200" alt="" />
            </Grid>
            <Grid item xs={4} textAlign="right">
                <Button variant="contained" onClick={githubLink}>
                    Github
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="body1" fontWeight={600}>
                    Run local containers in Kubernetes environments.
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((step, index) => (
                        <Step key={step.label} onClick={() => handleStepClick(index)}>
                            {index < activeStep ?
                            <StepButton>{step.label}</StepButton>
                            :
                            <StepLabel>{step.label}</StepLabel  >
                        }
                        </Step>
                    ))}
                </Stepper>
            </Grid>
        </>
    );
}