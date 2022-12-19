import { Button, Grid, Typography } from "@mui/material";

import { useState, useEffect, useRef, useMemo } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
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

    const container = false
    const scrollable = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        scrollable?.current?.scrollIntoView({ behavior: 'smooth' });
      }, [logs]);

    const [back, next] = useNavigation(
        { resetMode: false, step: 1, view: 'settings' },
        { resetMode: false, step: 3, view: 'run' },
    )

    useEffect(() => {
        ddClient.docker.cli.exec("logs", ["-f", "kind-control-plane"], {
            stream: {
              onOutput(data) {
                if (data.stdout) {
                  setOutput(old => old + data.stdout)
                } else {
                  console.log(data.stderr);
                }
              },
              onError(error) {
                console.error(error);
              },
              onClose(exitCode) {
                console.log("onClose with exit code " + exitCode);
              },
              splitOutputLines: false,
            },
          });

    }, [])



    return (
        <>
            <Grid item xs={6} alignItems="center">
                <Typography variant="subtitle1">
                    View logs
                </Typography>
            </Grid>
            
            {container ? <Grid item xs={12}>
                <ContainerLogs container="kind-control-plane" height={500} />
            </Grid>: ''}

            <Grid item xs={12} textAlign="right">
                <Button
                    variant="contained"
                    component="label"
                    color="error"
                    onClick={back}
                    sx={{ marginTop: 1 }}
                >
                    Stop container
                </Button>
            </Grid>
        </>
    )
}
