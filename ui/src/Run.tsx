import { Button, Grid, Typography } from "@mui/material";

import { useState, useEffect, useRef, useMemo } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import store from "./store";
import useNavigation from "./composable/navigation";
import { ContainerLogs } from "./components/ContainerLogs";


export function Run() {    
    const [output, setOutput] = useState<string>('')
    const ddClient = createDockerDesktopClient();

    function convertOutput(output: string) {
        return output.split("\n")
    }

    const logs = useMemo(() => {
        return convertOutput(output)
    }, [output])

    const scrollable = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        scrollable?.current?.scrollIntoView({ behavior: 'smooth' });
      }, [logs]);

    const [back, next] = useNavigation(
        { resetMode: false, step: 1, view: 'settings' },
        { resetMode: false, step: 3, view: 'run' },
    )

    const stopContainer = () => {
      ddClient.docker.cli.exec("stop", [store.getState().gefyra.containerName]).then(res => {
        console.log("stopped")
        console.log(res)
        back()
      })
    }


    return (
        <>
            <Grid item xs={6} alignItems="center">
                <Typography variant="subtitle1">
                    View logs
                </Typography>
            </Grid>
            
            <Grid item xs={12}>
                <ContainerLogs container={store.getState().gefyra.containerName} height={500} />
            </Grid>

            <Grid item xs={12} textAlign="right">
                <Button
                    variant="contained"
                    component="label"
                    color="error"
                    onClick={stopContainer}
                    sx={{ marginTop: 1 }}
                >
                    Stop container
                </Button>
            </Grid>
        </>
    )
}
