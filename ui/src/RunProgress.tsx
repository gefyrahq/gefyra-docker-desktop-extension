import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { GefyraRunRequest, GefyraStatusRequest, GefyraUpRequest } from 'gefyra/lib/protocol';
import { Gefyra } from './gefyraClient';
import { GefyraStatusBar } from './components/GefyraStatusBar';
import { checkCargoReady, checkStowawayReady, gefyraUp } from './utils/gefyra';
import { EnvironmentVariable } from './types';
import { setContainerName } from './store/gefyra';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import useNavigation from './composable/navigation';

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

  const dispatch = useDispatch();

  const [, next] = useNavigation(
    { resetMode: false, step: 2, view: 'container' },
    { resetMode: false, step: 4, view: 'logs' }
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

  useEffect(() => {
    async function run() {
      updateProgress('', 0, false);
      const gefyraClient = new Gefyra(ddClient);

      setRunLabel('Checking cluster for existing Gefyra installation.');
      const upRequest = new GefyraUpRequest();
      upRequest.kubeconfig = kubeconfig;
      upRequest.context = context;

      const runRequest = new GefyraRunRequest();
      const containerName = `gefyra-${(Math.random() + 1).toString(36).substring(7)}`;
      runRequest.image = image;
      runRequest.command = command;
      runRequest.namespace = namespace;
      runRequest.name = containerName;
      if (envFrom && envFrom !== 'select') {
        console.log(envFrom);
        runRequest.envfrom = envFrom;
      }
      dispatch(setContainerName(containerName));
      runRequest.env = environmentVariables.map(
        (item: EnvironmentVariable) => `${item.label}=${item.value}`
      );
      // TODO fix volumes - seems typing is wrong
      runRequest.volumes = volumeMounts.map((item) => `${item.host}:${item.container}`);

      const statusRequest = new GefyraStatusRequest();

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
          updateProgress('Cluster connection confirmed.', 5);
          if (!cluster.operator) {
            updateProgress('Gefyra Operator not found. Installing now.');
            const res = await gefyraUp(gefyraClient, upRequest);
            if (!res) {
              displayError('Could not install Gefyra');
              return;
            }
          } else {
            updateProgress('Gefyra Operator confirmed.', 15);
          }
          updateProgress('Waiting for stowaway to become ready.', 15);
          cluster = await checkStowawayReady(gefyraClient, 10).catch((err) => false);
          // cycles stowaway retry
          if (!cluster.stowaway) {
            displayError('Could not confirm Stowaway - fatal error.');
            return;
          }
          updateProgress('Gefyra Stowaway confirmed.', 25);
          if (!client.cargo) {
            updateProgress('Cargo not found - starting Cargo now...', 27);
            await gefyraUp(gefyraClient, upRequest);
            client = await checkCargoReady(gefyraClient, 10).catch((err) => false);
            if (!client.cargo) {
              displayError('Gefyra Cargo not running.');
              return;
            }
          }
          updateProgress('Gefyra Cargo confirmed.', 30);
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
          const runResult = await gefyraClient.exec(runRequest).then(async (res) => {
            const result = JSON.parse(res);
            console.log(result);
            return result.status === 'success';
          });
          if (!runResult) {
            displayError('Could not run container');
            return;
          }
          updateProgress('Container is running!', 100);
          next();
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
        <Grid item xs={11} sx={{ mt: 8, mb: 5 }}>
          <GefyraStatusBar label={runLabel} progress={runProgress} error={runError} />
        </Grid>
      </Grid>
    </>
  );
}
