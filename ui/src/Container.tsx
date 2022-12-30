import { Button, Grid, InputLabel, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { EnvironmentVariables } from './EnvironmentVariables';
import { VolumeMounts } from './VolumeMounts';
import { RootState } from './store';
import { setNamespace, setCommand } from './store/gefyra';
import useNavigation from './composable/navigation';
import { LSelect } from './components/LSelect';

export function Container() {
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const [namespaceInputActive, setNamespaceInputActive] = useState(false);
  const [selectNamespaces, setSelectNamespaces] = useState([]);

  const namespace = useAppSelector((state) => state.gefyra.namespace);
  const availableNamespaces = useAppSelector((state) => state.gefyra.availableNamespaces);
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

  function handleNamespaceChange(e, b): any {
    dispatch(setNamespace(e.target.value));
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
    initNamespaces();
  }, [dispatch, availableNamespaces, namespace]);

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
      <EnvironmentVariables />
      <VolumeMounts></VolumeMounts>

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
