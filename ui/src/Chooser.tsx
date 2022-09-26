import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { Mode } from "./Mode";


export function Chooser() {

    return (
        <>
            <Grid item xs={12} alignItems="center">
                <Typography variant="subtitle1">
                    Please select Gefyra's opration mode.
                </Typography>
            </Grid>
            <Grid item xs={6} alignItems="center">
                <Mode image="/assets/run.svg" imageAlt="Run container in Kubernetes" headline="Run Container in Kubernetes"
                    caption="Run a local container as new workload in a Kubernetes cluster." mode="run"/>
            </Grid>
            <Grid item xs={6}>
                <Mode image="/assets/bridge.svg" imageAlt="Bridge container in Kubernetes" headline="Bridge Container in Kubernetes"
                        caption="Bridge a local container into an existing workload of a Kubernetes cluster." mode="bridge"/>
            </Grid>
        </>
    )
}

