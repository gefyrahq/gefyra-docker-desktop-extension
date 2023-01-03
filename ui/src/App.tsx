import { useEffect } from 'react';
import { Alert, Paper, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { TopBar } from './TopBar';
import { Chooser } from './Chooser';
import { Progress } from './Progress';
import { Settings } from './Settings';
import { Container } from './Container';
import { Run } from './Run';
import { RootState } from './store';
import { closeSnackbar, setActiveStep, setView } from './store/ui';
import { RunProgress } from './RunProgress';

export function App() {
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  const dispatch = useDispatch();

  const view = useAppSelector((state) => state.ui.view);
  const kubeconfig = useAppSelector((state) => state.gefyra.kubeconfig);
  const snackbarVisible = useAppSelector((state) => state.ui.snackbarVisible);
  const snackbarText = useAppSelector((state) => state.ui.snackbarText);
  const snackbarType = useAppSelector((state) => state.ui.snackbarType);

  const hideSnackbar = () => {
    dispatch(closeSnackbar());
  };

  useEffect(() => {
    const initApp = () => {
      if (!kubeconfig) {
        dispatch(setView('settings'));
        dispatch(setActiveStep(1));
      }
    };
    initApp();
  }, [kubeconfig, dispatch]);

  return (
    <>
      <TopBar />
      <Paper variant="outlined" sx={{ p: 4, mt: 2 }}>
        <Grid container spacing={2}>
          <Progress />
          {view === 'mode' && <Chooser />}
          {view === 'settings' && <Settings />}
          {view === 'container' && kubeconfig && <Container />}
          {view === 'run' && kubeconfig && <RunProgress />}
          {view === 'logs' && <Run />}
        </Grid>
      </Paper>
      <Snackbar open={snackbarVisible} autoHideDuration={6000} onClose={hideSnackbar}>
        <Alert severity={snackbarType} sx={{ width: '100%' }} onClose={hideSnackbar}>
          {snackbarText}
        </Alert>
      </Snackbar>
    </>
  );
}
