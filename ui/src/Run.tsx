import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import TerminalIcon from '@mui/icons-material/Terminal';

import { useState, useEffect, useRef, useMemo } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import store, { RootState } from "./store";
import useNavigation from "./composable/navigation";
import { ContainerLogs } from "./components/ContainerLogs";
import { setSnackbar } from "./store/ui";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";


const copyShellText = "Copy Shell Command"

export function Run() {    
    const [output, setOutput] = useState<string>('')
    const [tooltipClipboard, setTooltipClipboard] = useState<string>("")
    const ddClient = createDockerDesktopClient();
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const containerName = useAppSelector(state => state.gefyra.containerName)

    const dispatch = useDispatch()

    function convertOutput(output: string) {
        return output.split("\n")
    }

    const logs = useMemo(() => {
        return convertOutput(output)
    }, [output])

    const checkContainerRunning = () => {
      ddClient.docker.listContainers({
        all: true,
        filters: JSON.stringify({name: [containerName]})
      }).then((res: any) => {
        if (res.length > 1) {
          console.warn("Cannot check container - multiple found.")
        }
        console.log(res)
        if (res.length === 1) {
          console.log(1)
          if (res[0].State !== "running") {
            console.log(2)
            dispatch(setSnackbar({text: "Container stopped for unknown reason. ", type: "warning"}))
            back()
          }
        }
        if (res.length === 0) {
          dispatch(setSnackbar({text: "Container lost for unknown reason. ", type: "warning"}))
          back()
        }
      })
    }

    const scrollable = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        scrollable?.current?.scrollIntoView({ behavior: 'smooth' });
      }, [logs]);

    useEffect(() => {
      setTooltipClipboard(copyShellText)
      const intervalId = setInterval(() => {
          checkContainerRunning()
      }, 5000)
      return(() => {
        clearInterval(intervalId)
      })
    }, [])

    

    const [back, next] = useNavigation(
        { resetMode: false, step: 1, view: 'settings' },
        { resetMode: false, step: 3, view: 'run' },
    )

    const stopContainer = () => {
      ddClient.docker.cli.exec("stop", [containerName]).then(res => {
        dispatch(setSnackbar({text: "Container stopped. ", type: "success"}))
        back()
      }).catch(err => {
        console.log(err)
        dispatch(setSnackbar({text: "Could not stop container. " + err.stderr, type: "error"}))
        back()
      })
    }

    const dockerCommandClipboard = () => {
      const command = `docker exec -it ${containerName} sh`
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

