import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Grid,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { EnvironmentVariables } from './components/EnvironmentVariables';
import { VolumeMounts } from './components/VolumeMounts';
import { RootState } from './store';
import {
  setNamespace,
  setCommand,
  setEnvFrom,
  setImage,
  setAvailableNamespaces,
  setContainerPortMapping,
  addContainerPortMapping,
  removeContainerPortMapping
} from './store/gefyra';
import useNavigation from './composable/navigation';
import { LSelect } from './components/LSelect';
import {
  K8sNamespaceRequest,
  K8sWorkloadsRequest,
  K8sWorkloadsResponse
} from 'gefyra/lib/protocol';
import { Gefyra } from './gefyraClient';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import useDockerImages from './composable/dockerImages';
import { DockerImage } from './types';
import { PortMappings } from './components/PortMappings';
import getWorkloads from './composable/workloads';

export function ContainerSettings() {
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  const ddClient = createDockerDesktopClient();

  const [namespaceInputActive, setNamespaceInputActive] = useState(false);
  const [selectNamespaces, setSelectNamespaces] = useState(
    [] as { label: string; value: string }[]
  );
  const [selectEnvFrom, setSelectEnvFrom] = useState([] as { label: string; value: string }[]);
  const [envFromActive, setEnvFromActive] = useState(false);

  const namespace = useAppSelector((state) => state.gefyra.namespace);
  const { images, loading: imagesLoading } = useDockerImages(namespace);

  const availableNamespaces = useAppSelector((state) => state.gefyra.availableNamespaces);

  const image = useAppSelector((state) => state.gefyra.image);
  const envFrom = useAppSelector((state) => state.gefyra.envFrom);
  const environmentVariables = useAppSelector((state) => state.gefyra.environmentVariables);
  const portMappings = useAppSelector((state) => state.gefyra.containerPortMappings);
  const volumeMounts = useAppSelector((state) => state.gefyra.volumeMounts);
  const kubeconfig = useAppSelector((state) => state.gefyra.kubeconfig);
  const context = useAppSelector((state) => state.gefyra.context);
  const availableWorkloads = useAppSelector((state) => state.gefyra.availableWorkloads);

  const command = useAppSelector((state) => state.gefyra.command);
  // TODO check if container is already running on startup

  const dispatch = useDispatch();

  const [back, next] = useNavigation(
    { resetMode: false, step: 0, view: 'settings' },
    { resetMode: false, step: 2, view: 'run' }
  );

  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCommand(e.target.value));
  };

  const updateEnvFromSelect = (namespaceVal: string) => {
    setEnvFromActive(false);
    setSelectEnvFrom([]);
    getWorkloads(namespaceVal).then((workloads) => {
      if (!envFrom || (workloads && !workloads.includes(envFrom))) {
        dispatch(setEnvFrom('select'));
      }
      if (workloads) {
        setSelectEnvFrom(
          [{ label: 'Select a workload', value: 'select' }].concat(
            workloads.map((w) => ({ label: w, value: w }))
          )
        );
      } else {
        setSelectEnvFrom([{ label: 'No workloads available', value: 'select' }]);
        dispatch(setEnvFrom('select'));
      }
      setEnvFromActive(true);
    });
  };

  function handleNamespaceChange(e: SelectChangeEvent<string>, b: object): any {
    const namespaceVal = e.target.value;
    dispatch(setNamespace(namespaceVal));
    updateEnvFromSelect(namespaceVal);
  }

  function handleEnvFromChange(e: SelectChangeEvent<string>, b: object): any {
    dispatch(setEnvFrom(e.target.value));
  }

  function handleImageChange(e: React.SyntheticEvent<Element, Event>, b: DockerImage | null) {
    dispatch(setImage(b ? b.name : ''));
  }

  useEffect(() => {
    async function initNamespaces() {
      setNamespaceInputActive(false);
      if (!availableNamespaces.length) {
        const ddClient = createDockerDesktopClient();
        const gefyraClient = new Gefyra(ddClient);
        const nsRequest = new K8sNamespaceRequest();
        nsRequest.kubeconfig = kubeconfig;
        nsRequest.context = context;
        await gefyraClient.k8sNamespaces(nsRequest).then((resp) => {
          if (resp.status !== 'error' && resp.response && resp.response.namespaces) {
            dispatch(setAvailableNamespaces(resp.response.namespaces));
          } else {
            ddClient.desktopUI.toast.error('Cannot load cluster namespaces.');
            back();
          }
        });
      }
      setSelectNamespaces(
        [{ label: 'Select a namespace', value: 'select' }].concat(
          availableNamespaces.map((n) => ({ label: n, value: n }))
        )
      );
      setNamespaceInputActive(true);
      if (!namespace) {
        dispatch(setNamespace('select'));
      }
    }
    if (namespace) {
      updateEnvFromSelect(namespace);
    }
    initNamespaces();
  }, [dispatch, availableNamespaces, namespace, envFrom, availableWorkloads]);

  return (
    <>
      <Grid item xs={12} alignItems="center">
        <Typography variant="subtitle1">Set Container Settings</Typography>
      </Grid>
      <Grid item xs={5}>
        <LSelect
          labelId="namespace-select-label"
          id="namespace-select"
          value={namespace}
          label="Namespace"
          handleChange={handleNamespaceChange}
          disabled={!namespaceInputActive}
          loading={!namespaceInputActive}
          items={selectNamespaces}
        />
      </Grid>

      <Grid item xs={6}>
        <LSelect
          labelId="envFrom-select-label"
          id="envFrom-select"
          value={envFrom}
          label="Copy Environment From"
          handleChange={handleEnvFromChange}
          disabled={!envFromActive}
          loading={!envFromActive}
          items={selectEnvFrom}
        />
      </Grid>

      <Grid item xs={5}>
        <Autocomplete
          id="grouped-images"
          options={images.sort((a, b) => -b.repo[0].localeCompare(a.repo[0]))}
          groupBy={(o) => o.type}
          getOptionLabel={(image: DockerImage) => image.name}
          renderInput={(params) => <TextField {...params} label="Image" />}
          loading={imagesLoading}
          disabled={imagesLoading}
          sx={{ width: '100%' }}
          value={{ name: image, type: 'image', repo: '' }}
          onChange={handleImageChange}
          noOptionsText="No Images found"
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          id="command"
          variant="outlined"
          label="Command (Overwrite)"
          fullWidth
          value={command}
          onInput={handleCommandChange}
        />
      </Grid>

      <Grid item xs={11}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Additional Environment Variables{' '}
              {environmentVariables.length ? `(${environmentVariables.length})` : ''}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <EnvironmentVariables />
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item xs={11}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Port Mappings {portMappings.length ? `(${portMappings.length})` : ''}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PortMappings state={portMappings} set={setContainerPortMapping} add={addContainerPortMapping} remove={removeContainerPortMapping}></PortMappings>
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item xs={11}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Volume Mounts {volumeMounts.length ? `(${volumeMounts.length})` : ''}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <VolumeMounts></VolumeMounts>
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
          sx={{ marginTop: 1, ml: 2 }}>
          Run
        </Button>
      </Grid>
    </>
  );
}
