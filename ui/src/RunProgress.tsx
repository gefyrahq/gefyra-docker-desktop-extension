import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Button, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  GefyraDownRequest,
  GefyraRunRequest,
  GefyraStatusRequest,
  GefyraUpRequest
} from 'gefyra/lib/protocol';
import { Gefyra } from './gefyraClient';
import { GefyraStatusBar } from './components/GefyraStatusBar';
import { checkCargoReady, checkStowawayReady, gefyraUp } from './utils/gefyra';
import { EnvironmentVariable, PortMapping } from './types';
import { setContainerName } from './store/gefyra';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import useNavigation from './composable/navigation';
import { resetSteps, setMode, setView } from './store/ui';

export function RunProgress() {
  const ddClient = createDockerDesktopClient();
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const [runLabel, setRunLabel] = useState('');
  const [runProgress, setRunProgress] = useState(0);
  const [runError, setRunError] = useState(false);

  const environmentVariables = useAppSelector((state) => state.gefyra.environmentVariables);
  const kubeconfig = useAppSelector((state) => state.gefyra.kubeconfig);
  const context = useAppSelector((state) => state.gefyra.context);
  const image = useAppSelector((state) => state.gefyra.image);
  const volumeMounts = useAppSelector((state) => state.gefyra.volumeMounts);
  const namespace = useAppSelector((state) => state.gefyra.namespace);
  const command = useAppSelector((state) => state.gefyra.command);
  const envFrom = useAppSelector((state) => state.gefyra.envFrom);
  const portMappings = useAppSelector((state) => state.gefyra.portMappings);
  const host = useAppSelector((state) => state.gefyra.host);
  const port = useAppSelector((state) => state.gefyra.port);

  const dispatch = useDispatch();

  const [back] = useNavigation(
    { resetMode: true, step: 0, view: 'settings' },
    { resetMode: true, step: 0, view: 'settings' }
  );

  function updateProgress(msg: string, progress?: number, error: boolean = false) {
    setRunLabel(msg);
    if (progress) {
      setRunProgress(progress);
    }
    setRunError(error);
  }

  function displayError(msg: string) {
    updateProgress(msg, null, true);
  }

  async function goToContainerLogs(id) {
    dispatch(setMode(''));
    dispatch(setView('home'));
    dispatch(resetSteps());
    try {
      await ddClient.desktopUI.navigate.viewContainerLogs(id);
    } catch (e) {
      console.error(e);
      ddClient.desktopUI.toast.error(`Failed to navigate to logs for container "${id}".`);
    }
  }

  function getContainerId(containerName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Pass in filter to only get containers with the name we want
      ddClient.docker
        .listContainers({
          all: true,
          filters: JSON.stringify({ name: [containerName] })
        })
        .then((containers: Array<any>) => {
          if (containers.length > 1) {
            reject('Multiple containers with same name found.');
          }
          if (containers.length === 1) {
            resolve(containers[0].Id);
          } else {
            reject('Container not found');
          }
        });
    });
  }

  useEffect(() => {
    async function run() {
      updateProgress('Checking current state of Gefyra.', 0, false);
      const statusRequest = new GefyraStatusRequest();
      const gefyraClient = new Gefyra(ddClient);
      await gefyraClient.exec(statusRequest).then(async (res) => {
        const response = JSON.parse(res).response;
        let client = response.client;
        if (client.kubeconfig !== kubeconfig || client.context !== context) {
          if (client.kubeconfig !== kubeconfig) {
            updateProgress('Kubeconfig changed. Restarting Gefyra.', 5);
          } else {
            updateProgress('Context changed. Restarting Gefyra.', 5);
          }
          // This is done to make sure Cargo is started with the correct settings
          const downRequest = new GefyraDownRequest();
          await gefyraClient.exec(downRequest);
        }
      });
      updateProgress('Checking cluster for existing Gefyra installation.', 10);

      const upRequest = new GefyraUpRequest();
      upRequest.kubeconfig = kubeconfig;
      upRequest.context = context;
      if (host) {
        upRequest.host = host;
      }
      if (port) {
        upRequest.port = port;
      } else {
        upRequest.port = 31820;
      }

      const runRequest = new GefyraRunRequest();
      const containerName = `gefyra-${(Math.random() + 1).toString(36).substring(7)}`;
      runRequest.image = image;
      runRequest.command = command;
      runRequest.namespace = namespace;
      runRequest.name = containerName;
      const portMap = {};
      portMappings.forEach((portMapping: PortMapping) => {
        portMap[Object.keys(portMapping)[0]] = portMapping[Object.keys(portMapping)[0]];
      });
      // @ts-ignore
      runRequest.ports = portMap;
      if (envFrom && envFrom !== 'select') {
        runRequest.envfrom = envFrom;
      }
      dispatch(setContainerName(containerName));
      runRequest.env = environmentVariables.map(
        (item: EnvironmentVariable) => `${item.label}=${item.value}`
      );
      runRequest.volumes = volumeMounts.map((item) => `${item.host}:${item.container}`);

      await gefyraClient
        .exec(statusRequest)
        .then(async (res) => {
          const response = JSON.parse(res).response;
          let cluster = response.cluster;
          let client = response.client;
          if (!cluster.connected) {
            displayError('Cluster connection not available.');
            return;
          }
          updateProgress('Cluster connection confirmed.', 15);
          if (!cluster.operator) {
            updateProgress('Gefyra Operator not found. Installing now.');
            const res = await gefyraUp(gefyraClient, upRequest);
            if (!res) {
              displayError('Could not install Gefyra');
              return;
            }
          } else {
            updateProgress('Gefyra Operator confirmed.', 20);
          }
          updateProgress('Waiting for stowaway to become ready.', 25);
          cluster = await checkStowawayReady(gefyraClient, 10).catch((err) => false);
          // cycles stowaway retry
          if (!cluster.stowaway) {
            displayError('Could not confirm Stowaway - fatal error.');
            return;
          }
          updateProgress('Gefyra Stowaway confirmed.', 30);
          if (!client.cargo) {
            updateProgress('Cargo not found - starting Cargo now...', 35);
            await gefyraUp(gefyraClient, upRequest);
            client = await checkCargoReady(gefyraClient, 10).catch((err) => false);
            if (!client.cargo) {
              displayError('Gefyra Cargo not running.');
              return;
            }
          }
          updateProgress('Gefyra Cargo confirmed.', 40);
          if (!client.network) {
            displayError('Gefyra network missing.');
            return;
          }
          updateProgress('Gefyra Network confirmed.', 50);
          if (!client.connection) {
            displayError('Gefyra Cargo connection not working.');
            return;
          }
          updateProgress('Gefyra Cargo connection confirmed.', 60);

          updateProgress('Starting local container.', 70);
          const runResult = await gefyraClient
            .exec(runRequest)
            .then(async (res) => {
              return res.response.status === 'success';
            })
            .catch((err) => {
              return false;
            });
          if (!runResult) {
            displayError('Could not run container');
            return;
          }
          updateProgress('Container is running!', 100);
          setTimeout(() => {
            getContainerId(containerName).then((id) => {
              goToContainerLogs(id);
            });
          }, 50000);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    run();
  }, []);

  return (
    <>
      <Grid container justifyContent="center">
        <Grid item xs={11} sx={{ mt: 8 }}>
          <GefyraStatusBar label={runLabel} progress={runProgress} error={runError} />
        </Grid>
        <Grid item xs={11} sx={{ mt: 2, mb: 5 }} textAlign="right">
          {runError && (
            <Button
              variant="contained"
              component="label"
              color="error"
              onClick={back}
              sx={{ marginTop: 1 }}>
              Cancel
            </Button>
          )}
        </Grid>
      </Grid>
    </>
  );
}
