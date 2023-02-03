import { useEffect } from 'react';
import { Alert, Paper, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { TopBar } from './TopBar';
import { Home } from './Home';
import { Progress } from './Progress';
import { KubernetesSettings } from './KubernetesSettings';
import { ContainerSettings } from './ContainerSettings';
import { RootState } from './store';
import { closeSnackbar, setActiveStep, setTrackingId, setView } from './store/ui';
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
        dispatch(setView('home'));
        dispatch(setActiveStep(0));
        dispatch(setTrackingId());
      }
    };
    initApp();
  }, [kubeconfig, dispatch]);

  return (
    <>
      <TopBar />
      <Paper variant="outlined" sx={{ p: 4, mt: 2 }}>
        {view === 'home' ? (
          <Home />
        ) : (
          <Grid container spacing={3}>
            <Progress />
            {view === 'settings' && <KubernetesSettings />}
            {view === 'container' && kubeconfig && <ContainerSettings />}
            {view === 'run' && kubeconfig && <RunProgress />}
          </Grid>
        )}
      </Paper>
      <Snackbar open={snackbarVisible} autoHideDuration={6000} onClose={hideSnackbar}>
        <Alert severity={snackbarType} sx={{ width: '100%' }} onClose={hideSnackbar}>
          {snackbarText}
        </Alert>
      </Snackbar>
    </>
  );
}
