import React, {useEffect} from 'react';
import { Alert, Paper, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { TopBar } from './TopBar';
import { Chooser } from './Chooser';
import { GefyraStatus } from './types';
import { Progress } from './Progress'
import { Settings } from './Settings'
import { Container } from './Container'
import { Run } from './Run'
import store, { RootState } from './store'
import { closeSnackbar, setActiveStep, setView } from './store/ui';




export function App() {
    const [status, setStatus] = React.useState<GefyraStatus>({
        text: '',
        action: '',
        help: ''
    });
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
    const dispatch = useDispatch()

    const view = useAppSelector(state => state.ui.view)
    const kubeconfig = useAppSelector(state => state.gefyra.kubeconfig)
    const snackbarVisible = useAppSelector(state => state.ui.snackbarVisible)
    const snackbarText = useAppSelector(state => state.ui.snackbarText)
    const snackbarType = useAppSelector(state => state.ui.snackbarType)

    const initApp = () => {
        if (!kubeconfig) {
            console.log("init app")
            dispatch(setView('settings'))
            dispatch(setActiveStep(1))
        }
    }

    const hideSnackbar = () => {
        dispatch(closeSnackbar())
    }

    useEffect(() => {
        initApp()
    }, [kubeconfig])


    return (
        <>
        <TopBar/>
        <Paper  variant="outlined" sx={{p: 4, mt: 2}}>
        <Grid container spacing={2}>
            <Progress />
            { view === 'mode' &&
                <Chooser/>
            }
            { view === 'settings' &&
                <Settings />
            }
            { view === 'container' && kubeconfig &&
                <Container />
            }
            { view === 'run' &&
                <Run />
            }
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
