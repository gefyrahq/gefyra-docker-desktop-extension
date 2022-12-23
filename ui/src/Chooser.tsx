import { Grid, Typography } from "@mui/material";
import { Mode } from "./Mode";
import { ReactComponent as RunSVG } from "./assets/run.svg"
import { ReactComponent as BridgeSVG } from "./assets/bridge.svg"



export function Chooser() {

    return (
        <>
            <Grid item xs={12} alignItems="center">
                <Typography variant="subtitle1">
                    Please select Gefyra's opration mode.
                </Typography>
            </Grid>
            <Grid item xs={6} alignItems="center">
                <Mode image={RunSVG} imageAlt="Run container in Kubernetes" headline="Run Container in Kubernetes"
                    caption="Run a local container as new workload in a Kubernetes cluster." mode="run"/>
            </Grid>
            <Grid item xs={6}>
                <Mode image={BridgeSVG} imageAlt="Bridge container in Kubernetes" headline="Bridge Container in Kubernetes"
                        caption="Bridge a local container into an existing workload of a Kubernetes cluster." mode="bridge" disabled/>
            </Grid>
        </>
    )
}

