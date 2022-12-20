import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import TerminalIcon from '@mui/icons-material/Terminal';

import { useState, useEffect, useRef, useMemo } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import store from "./store";
import useNavigation from "./composable/navigation";
import { ContainerLogs } from "./components/ContainerLogs";
import { setSnackbar } from "./store/ui";
import { useDispatch } from "react-redux";


const copyShellText = "Copy Shell Command"

export function Run() {    
    const [output, setOutput] = useState<string>('')
    const [tooltipClipboard, setTooltipClipboard] = useState<string>("")
    const ddClient = createDockerDesktopClient();
    const dispatch = useDispatch()

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

    useEffect(() => {
      setTooltipClipboard(copyShellText)
    }, [])

    const [back, next] = useNavigation(
        { resetMode: false, step: 1, view: 'settings' },
        { resetMode: false, step: 3, view: 'run' },
    )

    const stopContainer = () => {
      ddClient.docker.cli.exec("stop", [store.getState().gefyra.containerName]).then(res => {
        console.log("stopped")
        console.log(res)
        back()
      }).catch(err => {
        console.log(err)
        dispatch(setSnackbar({text: "Could not stop container. " + err.stderr, type: "error"}))
        back()
      })
    }

    const dockerCommandClipboard = () => {
      const command = `docker exec -it ${store.getState().gefyra.containerName} sh`
      navigator.clipboard.writeText(command);
      setTooltipClipboard("Command copied!")
      setTimeout(() => {
        setTooltipClipboard(copyShellText)
      }, 1500)
    }


    return (
        <>
            <Grid item xs={6} alignItems="center">
                <Typography variant="subtitle1">
                    View logs
                </Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Tooltip title={tooltipClipboard}>
                <IconButton onClick={dockerCommandClipboard} sx={{mr: 2}}>
                  <TerminalIcon />
                </IconButton>
              </Tooltip>
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

