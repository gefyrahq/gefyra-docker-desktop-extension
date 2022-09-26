import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Button, Grid, Typography, Stepper, Step, StepButton, StepLabel } from "@mui/material";

export function TopBar() {
    const docker = createDockerDesktopClient();
    function githubLink(e) {
        docker.host.openExternal("https://github.com/gefyrahq/gefyra");
    }
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
        </>
    );
}