import React, {useEffect} from 'react';
import Button from '@mui/material/Button';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, Select, InputLabel, TextField, MenuItem, Typography } from '@mui/material';
import { Gefyra } from './gefyraClient';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();
const gefyra = new Gefyra(client)

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [response, setResponse] = React.useState<string>();
  const [availableContexts, setAvailableContexts] = React.useState<string[]>([]);
  const [context, setContext] = React.useState<string>("test");
  const ddClient = useDockerDesktopClient();

  const handleContextChange = async (e, b) => {
      setContext(e.target.value)
  }

  useEffect(() => {
    setAvailableContexts(["test", "bulbby", "blubb"])
      gefyra.version().then(res => {
          console.log(res)
      })
  }, []);


  const fetchAndDisplayResponse = async () => {
   await ddClient.extension.host.cli.exec("kubectl", ["config", "get-contexts"], {
      stream: {
        onOutput(data): void {
          if (data.stdout) {
            console.error(data.stdout);
          } else {
            console.log(data.stderr);
          }
        },
        onError(error: any): void {
          console.error(error);
        },
        onClose(exitCode: number): void {
          console.log("onClose with exit code " + exitCode);
        },
      },
    });

  };

  return (
    <>
      <Typography variant="h3">Gefyra Docker Desktop Extension1</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        Bridge containers into Kubernetes clusters with ease.
      </Typography>
      <InputLabel id="context-select-label">Context</InputLabel>
      <Select labelId="context-select-label" id="context-select" value={context} label="Context" onChange={handleContextChange}>
          {availableContexts.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
      </Select>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            No gefyra cluster installation detected.
        </Typography>
        <Button variant="contained" onClick={fetchAndDisplayResponse}>
          Install gefyra cluster-side components
        </Button>

        <TextField
          label="Backend response"
          sx={{ width: 480 }}
          disabled
          multiline
          variant="outlined"
          minRows={5}
          value={response ?? ''}
        />
    </>
  );
}
