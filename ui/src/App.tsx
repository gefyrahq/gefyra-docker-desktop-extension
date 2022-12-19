import React, {useEffect} from 'react';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { TopBar } from './TopBar';
import { Chooser } from './Chooser';
import { GefyraStatus } from './types';
import { Progress } from './Progress'
import { Settings } from './Settings'
import { Container } from './Container'
import { Run } from './Run'
import { RootState } from './store'
import { setActiveStep, setView } from './store/ui';




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

    const initApp = () => {
        if (!kubeconfig) {
            console.log("init app")
            dispatch(setView('settings'))
            dispatch(setActiveStep(1))
        }
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
        </>
    );
}
