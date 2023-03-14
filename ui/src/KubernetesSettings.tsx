import { createDockerDesktopClient } from '@docker/extension-api-client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';
import { K8sContextRequest, K8sContextResponse, K8sNamespaceRequest } from 'gefyra/lib/protocol';

import { Gefyra } from './gefyraClient';
import {
  setContext,
  setKubeconfig,
  setAvailableNamespaces,
  setHost,
  setPort
} from './store/gefyra';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import store, { RootState } from './store';
import { LSelect } from './components/LSelect';
import useNavigation from './composable/navigation';
import { setSnackbar } from './store/ui';
import { AdvancedClusterSettings } from './components/AdvancedClusterSettings';

const selectContext = 'Please select a context';

export function KubernetesSettings() {
  const dispatch = useDispatch();

  const ddClient = createDockerDesktopClient();

  const [availableContexts, setAvailableContexts] = useState<{ label: string; value: string }[]>(
    []
  );
  const [contextLoading, setContextLoading] = useState<boolean>(false);
  const [nextEnabled, setNextEnabled] = useState<boolean>(false);

  const [back, next] = useNavigation(
    { resetMode: true, step: 0, view: 'home' },
    { resetMode: false, step: 1, view: 'container' }
  );

  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const kubeconfig = useAppSelector((state) => state.gefyra.kubeconfig);
  const context = useAppSelector((state) => state.gefyra.context);

  const gefyraClient = new Gefyra(ddClient);

  function loadContexts() {
    setContextLoading(true);
    const contextRequest = new K8sContextRequest();
    contextRequest.kubeconfig = store.getState().gefyra.kubeconfig;

    gefyraClient
      .exec(contextRequest)
      .then((res) => {
        const parsed: K8sContextResponse = JSON.parse(res);
        const contexts = parsed.response.contexts;
        const contextItems = contexts.map((c) => {
          return { label: c, value: c };
        });
        if (contexts.length === 1) {
          setAvailableContexts(contextItems);
          dispatch(setContext(contexts[0]));
        } else {
          if (!context) {
            dispatch(setContext(selectContext));
          }
          setAvailableContexts(
            [{ label: selectContext, value: selectContext }].concat(contextItems)
          );
        }
        setContextLoading(false);
      })
      .catch((err) => console.error(err));
  }

  async function handleKubeConfigChange() {
    dispatch(setContext(''));
    const result = await ddClient.desktopUI.dialog.showOpenDialog({
      filters: [
        {
          extensions: ['yaml', 'yml']
        }
      ],
      properties: ['openFile']
    });
    if (!result.canceled) {
      const directory = result.filePaths.shift();
      if (directory !== undefined) {
        dispatch(setKubeconfig(directory));
      }
      loadContexts();
    }
  }

  useEffect(() => {
    if (kubeconfig && context) {
      checkNextEnabled();
      if (context === 'docker-desktop') {
        getDockerDesktopHost().then((res) => {
          dispatch(setHost(res));
        });
      } else {
        dispatch(setHost(''));
      }
      dispatch(setPort(31820));
    }
  }, [kubeconfig, context]);

  async function getDockerDesktopHost(): Promise<string> {
    const res = await ddClient.docker.cli.exec('version', [
      '-f',
      '"{{ json .Server.Platform.Name }}"'
    ]);
    const ddVersion = res.stdout;
    return new Promise((resolve, reject) => {
      // get semantic version of docker desktop from "Docker Desktop 4.16.2 (95914)" via regex
      const versionRegex = /Docker Desktop (\d+\.\d+\.\d+) \(\d+\)/;
      const match = ddVersion.match(versionRegex);
      if (match && match.length > 1) {
        const version = match[1];
        const versionParts = version.split('.');
        const major = versionParts[0];
        const minor = versionParts[1];
        if (parseInt(major) >= 4 && parseInt(minor) >= 16) {
          console.debug(
            "Detected Docker Desktop version >= 4.16.x, using 'kubernetes.docker.internal'"
          );
          resolve('kubernetes.docker.internal');
        }
      }
      resolve('');
    });
  }

  async function handleContextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNextEnabled(false);
    dispatch(setContext(e.target.value));
  }

  function checkNextEnabled() {
    const namespaceError = 'Cannot load cluster namespaces. Is the cluster running?';
    if (kubeconfig && context && context !== selectContext) {
      dispatch(setSnackbar({ text: 'Checking available namespaces.', type: 'info' }));
      const nsRequest = new K8sNamespaceRequest();
      nsRequest.kubeconfig = kubeconfig;
      nsRequest.context = context;
      gefyraClient
        .exec(nsRequest)
        .then((res) => {
          console.log(res);
          const resp = JSON.parse(res);
          if (res.status !== 'error' && resp.response && resp.response.namespaces) {
            dispatch(setSnackbar({ text: 'Namespaces have been loaded.', type: 'success' }));
            dispatch(setAvailableNamespaces(resp.response.namespaces));
            setNextEnabled(true);
          } else {
            ddClient.desktopUI.toast.error(namespaceError);
          }
        })
        .catch((err) => {
          ddClient.desktopUI.toast.error(namespaceError);
        });
      // TODO handle namespaces not available
    } else {
      setNextEnabled(false);
    }
  }

  useEffect(() => {
    if (kubeconfig && !availableContexts.length) {
      loadContexts();
    }
  }, []);

  return (
    <>
      <Grid item xs={12} alignItems="center">
        <Typography variant="subtitle1">Set Kubernetes Settings</Typography>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <TextField
            id="kubeconfig"
            variant="outlined"
            label="Kubeconfig"
            fullWidth
            InputProps={{ readOnly: true }}
            value={kubeconfig}
            onClick={handleKubeConfigChange}
          />
        </FormControl>
        <Button
          variant="contained"
          component="label"
          color="primary"
          sx={{ mt: 1 }}
          onClick={handleKubeConfigChange}>
          Choose Kubeconfig
        </Button>
      </Grid>
      <Grid item xs={5}>
        <LSelect
          disabled={contextLoading}
          loading={contextLoading}
          value={context}
          label={'Context'}
          items={availableContexts}
          id={'context-input'}
          labelId={'context-select-label'}
          handleChange={handleContextChange}></LSelect>
      </Grid>
      <Grid item xs={11}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Advanced Cluster Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AdvancedClusterSettings></AdvancedClusterSettings>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          component="label"
          color="secondary"
          onClick={back}
          sx={{ marginTop: 1 }}>
          Back
        </Button>
        <Button
          variant="contained"
          component="label"
          color="primary"
          onClick={next}
          sx={{ marginTop: 1, ml: 2 }}
          disabled={!nextEnabled}>
          Next
        </Button>
      </Grid>
    </>
  );
}
