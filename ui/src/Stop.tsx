import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Button, Grid } from '@mui/material';
import { GefyraDownRequest } from 'gefyra/lib/protocol';
import { useEffect, useState } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { GefyraStatusBar } from './components/GefyraStatusBar';
import useNavigation from './composable/navigation';
import { Gefyra } from './gefyraClient';
import { RootState } from './store';
import { notFresh } from './store/ui';

export function Stop() {
  const ddClient = createDockerDesktopClient();
  const gefyraClient = new Gefyra(ddClient);
  const [runLabel, setRunLabel] = useState('');
  const [runProgress, setRunProgress] = useState(0);
  const [backEnabled, setBackEnabled] = useState(false);

  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const dispatch = useDispatch();

  const [back] = useNavigation(
    { resetMode: true, step: 0, view: 'settings' },
    { resetMode: true, step: 0, view: 'settings' }
  );

  const appJustStarted = useAppSelector((state) => state.ui.fresh);

  useEffect(() => {
    async function down() {
      setRunLabel('Gracefully stopping Gefyra');
      setRunProgress(20);
      const downRequest = new GefyraDownRequest();
      await gefyraClient.exec(downRequest);
      setRunLabel('Gefyra has been stopped');
      setRunProgress(100);
      setBackEnabled(true);
    }
    if (!appJustStarted) {
      down();
    } else {
      dispatch(notFresh());
      back();
    }
  }, []);

  return (
    <>
      <Grid container justifyContent="center">
        <Grid item xs={11} sx={{ mt: 8 }}>
          <GefyraStatusBar label={runLabel} progress={runProgress} />
        </Grid>
        <Grid item xs={11} sx={{ mt: 2, mb: 5 }} textAlign="right">
          <Button
            variant="contained"
            component="label"
            color="primary"
            onClick={back}
            disabled={!backEnabled}
            sx={{ marginTop: 1 }}>
            Back
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
