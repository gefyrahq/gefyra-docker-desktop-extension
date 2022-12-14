import React, {useEffect} from 'react';
import Button from '@mui/material/Button';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import { Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import store from './store'
import { Provider, TypedUseSelectorHook, useSelector } from 'react-redux'

import {Gefyra} from './gefyraClient';
import { TopBar } from './TopBar';
import { Chooser } from './Chooser';
import { GefyraStatus, statusMap } from './types';
import { Progress } from './Progress'
import { Settings } from './Settings'
import { Container } from './Container'
import { Run } from './Run'
import { RootState } from './store'


const client = createDockerDesktopClient();
const gefyra = new Gefyra(client);

function useDockerDesktopClient() {
    return client;
}

export function App() {
    const [status, setStatus] = React.useState<GefyraStatus>({
        text: '',
        action: '',
        help: ''
    });
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

    const mode = useAppSelector(state => state.ui.mode)
    const view = useAppSelector(state => state.ui.view)


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
            { view === 'container' &&
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
