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
import { RootState } from './store';
import {
  setBridgeTimeout,
  setTarget
} from './store/gefyra';
import useNavigation from './composable/navigation';
import { LSelect } from './components/LSelect';
import {
  GefyraBridgeRequest
} from 'gefyra/lib/protocol';
import { Gefyra } from './gefyraClient';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { PortMapping } from './types';
import { PortMappings } from './components/PortMappings';
import getWorkloads from './composable/workloads';

export function BridgeSettings() {
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  const ddClient = createDockerDesktopClient();

  const [selectTarget, setSelectTarget] = useState([] as { label: string; value: string }[]);
  const [targetActive, setTargetActive] = useState(false);

  const namespace = useAppSelector((state) => state.gefyra.bridgeNamespace);
  const bridgeContainer = useAppSelector((state) => state.gefyra.bridgeContainer);

  const target = useAppSelector((state) => state.gefyra.target);
  const portMappings = useAppSelector((state) => state.gefyra.portMappings);

  const timeout = useAppSelector((state) => state.gefyra.timeout);

  const dispatch = useDispatch();

  const [back, next] = useNavigation(
    { resetMode: false, step: 0, view: 'home' },
    { resetMode: false, step: 2, view: 'run' }
  );

  function handleTimeoutChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch(setBridgeTimeout(e.target.value));
  }

  function handleTargetChange(e: SelectChangeEvent<string>, b: object): any {
    dispatch(setTarget(e.target.value));
  }

  function bridge() {
    const bridgeRequest = new GefyraBridgeRequest();
    bridgeRequest.namespace = namespace;
    bridgeRequest.target = target;
    const portMap: { [container: string]: string } = {};
    portMappings.forEach((portMapping: PortMapping) => {
      portMap[portMapping[Object.keys(portMapping)[0]]] = Object.keys(portMapping)[0];
    });
    bridgeRequest.ports = portMap;
    bridgeRequest.name = bridgeContainer;
    bridgeRequest.timeout = 5000;
    const ddClient = createDockerDesktopClient();
    const gefyraClient = new Gefyra(ddClient);
    console.log(bridgeRequest);
    gefyraClient.bridge(bridgeRequest).then((response) => {
      console.log(response);
    });
  }

  useEffect(() => {
    getWorkloads(namespace).then((workloads: string[]) => {
      if (!workloads.length) {
        setSelectTarget([{ label: 'No workloads found', value: 'select' }]);
        setTarget('select');
        setTargetActive(true);
        return;
      }
      setSelectTarget(
        [{ label: 'Select a workload', value: 'select' }].concat(
          workloads.map((w) => {
            return { label: w, value: w };
          })
        )
      );
      setTargetActive(true);
    });
  }, []);

  return (
    <>
      <Grid item xs={12} alignItems="center">
        <Typography variant="subtitle1">Bridge Settings for {bridgeContainer}</Typography>
      </Grid>
      <Grid item xs={6}>
        <LSelect
          labelId="target-select-label"
          id="target-select"
          value={target}
          label="Target"
          handleChange={handleTargetChange}
          disabled={!targetActive}
          loading={!targetActive}
          items={selectTarget}
        />
      </Grid>

      <Grid item xs={5}>
        <TextField
          id="timeout"
          variant="outlined"
          label="Timeout"
          fullWidth
          value={timeout}
          onInput={handleTimeoutChange}
        />
      </Grid>

      <Grid item xs={11}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Port Mappings {portMappings.length ? `(${portMappings.length})` : ''}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PortMappings></PortMappings>
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
          Cancel
        </Button>
        <Button
          variant="contained"
          component="label"
          color="primary"
          onClick={bridge}
          sx={{ marginTop: 1, ml: 2 }}>
          Bridge
        </Button>
      </Grid>
    </>
  );
}
