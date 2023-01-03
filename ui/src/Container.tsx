import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Grid,
  InputLabel,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { EnvironmentVariables } from './EnvironmentVariables';
import { VolumeMounts } from './VolumeMounts';
import { RootState } from './store';
import { setNamespace, setCommand, setEnvFrom, setImage } from './store/gefyra';
import useNavigation from './composable/navigation';
import { LSelect } from './components/LSelect';
import { K8sWorkloadsRequest, K8sWorkloadsResponse } from 'gefyra/lib/protocol';
import { Gefyra } from './gefyraClient';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import useDockerImages from './composable/dockerImages';
import { DockerImage } from './types';

export function Container() {
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  const ddClient = createDockerDesktopClient();

  const [namespaceInputActive, setNamespaceInputActive] = useState(false);
  const [selectNamespaces, setSelectNamespaces] = useState([]);
  const [selectEnvFrom, setSelectEnvFrom] = useState([]);
  const [envFromActive, setEnvFromActive] = useState(false);

  const namespace = useAppSelector((state) => state.gefyra.namespace);
  const { images, loading: imagesLoading } = useDockerImages(namespace);

  const availableNamespaces = useAppSelector((state) => state.gefyra.availableNamespaces);
  const image = useAppSelector((state) => state.gefyra.image);

  const envFrom = useAppSelector((state) => state.gefyra.envFrom);
  const availableWorkloads = useAppSelector((state) => state.gefyra.availableWorkloads);

  const command = useAppSelector((state) => state.gefyra.command);
  // TODO check if container is already running on startup

  const dispatch = useDispatch();

  const [back, next] = useNavigation(
    { resetMode: false, step: 1, view: 'settings' },
    { resetMode: false, step: 3, view: 'run' }
  );

  const handleCommandChange = (e) => {
    dispatch(setCommand(e.target.value));
  };

  const updateEnvFromSelect = (namespaceVal) => {
    const wlrRequest = new K8sWorkloadsRequest();

    const gefyraClient = new Gefyra(ddClient);
    gefyraClient.exec(wlrRequest).then((res) => {
      const wlr: K8sWorkloadsResponse = JSON.parse(res);
      if (!envFrom) {
        dispatch(setEnvFrom('select'));
      }
      setEnvFromActive(true);
      setSelectEnvFrom(
        [{ label: 'Select a workload', value: 'select' }].concat(
          wlr.response.workloads[namespaceVal].map((w) => ({ label: w, value: w }))
        )
      );
    });
  };

  function handleNamespaceChange(e, b): any {
    const namespaceVal = e.target.value;
    dispatch(setNamespace(namespaceVal));
    updateEnvFromSelect(namespaceVal);
  }

  function handleEnvFromChange(e, b): any {
    dispatch(setEnvFrom(e.target.value));
  }

  function handleImageChange(e, b: DockerImage) {
    dispatch(setImage(b ? b.name : null));
  }

  useEffect(() => {
    function initNamespaces() {
      setNamespaceInputActive(true);
      setSelectNamespaces(
        [{ label: 'Select a namespace', value: 'select' }].concat(
          availableNamespaces.map((n) => ({ label: n, value: n }))
        )
      );
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
        <Typography variant="subtitle1">Configure your container.</Typography>
      </Grid>
      <Grid item xs={5}>
        <InputLabel sx={{ mb: 1 }} id="namespace-select-label">
          Namespace
        </InputLabel>
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
      <Grid item xs={7}>
        <InputLabel sx={{ mb: 1 }} id="image-select-label">
          Image
        </InputLabel>
        <Autocomplete
          id="grouped-images"
          options={images.sort((a, b) => -b.repo[0].localeCompare(a.repo[0]))}
          groupBy={(o) => o.type}
          getOptionLabel={(image: DockerImage) => image.name}
          renderInput={(params) => <TextField {...params} />}
          loading={imagesLoading}
          disabled={imagesLoading}
          inputValue={image}
          sx={{ width: 300 }}
          onChange={handleImageChange}
          noOptionsText="No Images found"
        />
      </Grid>

      <Grid item xs={5}>
        <InputLabel sx={{ mb: 1 }} id="envFrom-select-label">
          Copy environment from
        </InputLabel>
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
      <Grid item xs={6}>
        <InputLabel sx={{ mb: 1 }} id="command-label">
          Command (Overwrite)
        </InputLabel>
        <TextField
          id="command"
          variant="outlined"
          fullWidth
          value={command}
          onInput={handleCommandChange}
        />
      </Grid>

      <Grid item xs={11}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Additional Environment Variables</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <EnvironmentVariables />
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={11}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Volume Mounts</Typography>
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
          sx={{ marginTop: 1, ml: 2 }}>
          Run
        </Button>
      </Grid>
    </>
  );
}
