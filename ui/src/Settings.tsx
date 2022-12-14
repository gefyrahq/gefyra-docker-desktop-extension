import { createDockerDesktopClient } from '@docker/extension-api-client';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  InputLabel,
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
import { RemoteClusterSettings } from './components/RemoteClusterSettings';

const selectContext = 'Please select a context';

export function Settings() {
  const dispatch = useDispatch();

  const ddClient = createDockerDesktopClient();

  const [availableContexts, setAvailableContexts] = useState([]);
  const [contextLoading, setContextLoading] = useState<boolean>(false);
  const [nextEnabled, setNextEnabled] = useState<boolean>(false);

  const [back, next] = useNavigation(
    { resetMode: true, step: 0, view: 'mode' },
    { resetMode: false, step: 2, view: 'container' }
  );

  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const kubeconfig = useAppSelector((state) => state.gefyra.kubeconfig);
  const context = useAppSelector((state) => state.gefyra.context);

  const gefyraClient = new Gefyra(ddClient);

  function loadContexts() {
    setContextLoading(true);
    let contextRequest = new K8sContextRequest();
    contextRequest.kubeconfig = store.getState().gefyra.kubeconfig;

    gefyraClient
      .exec(contextRequest)
      .then((res) => {
        let parsed: K8sContextResponse = JSON.parse(res);
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

  async function handleKubeConfigChange(e) {
    dispatch(setKubeconfig(''));
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
    checkNextEnabled();
    dispatch(setHost(''));
    dispatch(setPort(31820));
  }, [kubeconfig, context]);

  async function handleContextChange(e, b) {
    setNextEnabled(false);
    dispatch(setContext(e.target.value));
  }

  function checkNextEnabled() {
    if (kubeconfig && context) {
      dispatch(setSnackbar({ text: 'Checking available namespaces.', type: 'info' }));

      const nsRequest = new K8sNamespaceRequest();
      nsRequest.kubeconfig = kubeconfig;
      nsRequest.context = context;
      gefyraClient.exec(nsRequest).then((res) => {
        const resp = JSON.parse(res);
        if (res.status !== 'error' && resp.response && resp.response.namespaces) {
          dispatch(setSnackbar({ text: 'Namespaces have been loaded.', type: 'success' }));
          dispatch(setAvailableNamespaces(resp.response.namespaces));
          setNextEnabled(true);
        } else {
          ddClient.desktopUI.toast.error('Cannot load cluster namespaces.');
        }
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
        <Typography variant="subtitle1">Please set Kubernetes configuration.</Typography>
      </Grid>
      <Grid item xs={5}>
        <InputLabel sx={{ mb: 1 }} id="kubeconfig-label">
          Kubeconfig
        </InputLabel>
        <TextField
          id="kubeconfig"
          variant="outlined"
          fullWidth
          InputProps={{ readOnly: true }}
          value={kubeconfig}
          onClick={handleKubeConfigChange}
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          component="label"
          color="primary"
          onClick={handleKubeConfigChange}
          sx={{ marginTop: '37px', ml: -1 }}>
          Choose Kubeconfig
        </Button>
      </Grid>
      <Grid item xs={4}>
        <InputLabel sx={{ mb: 1 }} id="context-select-label">
          Context
        </InputLabel>
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
            <Typography>Remote Cluster Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <RemoteClusterSettings></RemoteClusterSettings>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          component="label"
          color="primary"
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
