import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Box } from "@mui/material";
import Ansi from "ansi-to-react";

import { useState, useEffect, useRef, useMemo } from "react";

import { ContainerLogsProps } from "../types";


export function ContainerLogs(props: ContainerLogsProps) {
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

    useEffect(() => {
        setOutput('Loadings logs...')
        ddClient.docker.cli.exec("logs", ["-f", props.container], {
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

    const styles = {
        height: props.height,
        bgcolor: '#101010',
        px: 3,
        py: 2,
        color: 'grey.300',
        overflowX: 'hidden',
        overflowY: 'scroll'
    }

    return (
        <Box sx={styles}>{logs.map((log, index) => <div><Ansi key={index} linkify>{log}</Ansi></div>)}
            <div ref={scrollable} />
        </Box>
    )
}
