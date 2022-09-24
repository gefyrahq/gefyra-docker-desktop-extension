import React, {useEffect} from 'react';
import Button from '@mui/material/Button';
import {createDockerDesktopClient} from '@docker/extension-api-client';
import { Typography, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import Grid from '@mui/material/Grid';
import store from './store'
import { Provider, TypedUseSelectorHook, useSelector } from 'react-redux'

import {Gefyra} from './gefyraClient';
import { TopBar } from './TopBar';
import { Chooser } from './Chooser';
import { GefyraStatus, statusMap } from './types';
import { Settings } from './Settings'
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
    
    const [images, setImages] = React.useState<any[]>([]);
    const ddClient = useDockerDesktopClient();

    useEffect(() => {
        setStatus(statusMap[0])
        ddClient.docker.listImages().then((res: any) => {
            if (!res) return;
            const images = []
            res.map(i => {
                const image: {repo?: string, tag?: string, id?: string} = {}
                if (i.RepoTags) {
                    console.log(i.RepoTags)
                    image.repo = i.RepoTags[0].split(":")[0];
                    image.tag = i.RepoTags[0].split(":")[1];
                }
                else {
                    return
                }
                if (image.repo !== '<none>') {
                    image.id = i.Id;
                    images.push(image);
                }

            })
            setImages(images);
        });
    }, []);

    const fetchAndDisplayResponse = async () => {
        gefyra.status().then(res => {
            alert(res.status)
        })

    };

    return (
        <>
            <Grid container spacing={2}>
                <TopBar/>
                { view === 'mode' &&
                    <Chooser/>
                }
                { view === 'settings' &&
                    <Settings />
                }
                <Grid item xs={6}>
                    <Typography variant="body1" fontWeight={600} sx={{mt: 2}}>
                        Status:
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {status.text}
                    </Typography>
                    {status.loading ? (
                            <LinearProgress sx={{mr: 5, mt: 1}}/>
                        )
                        : ''
                    }
                    {status.action ? (
                        <div>
                            <Typography variant="body1" fontWeight={600} sx={{mt: 2}}>
                                What to do:
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {status.action}
                            </Typography>
                        </div>) : ''
                    }
                    <Button variant="contained" onClick={fetchAndDisplayResponse} sx={{mt: 3}}>
                        Install gefyra cluster-side components
                    </Button>
                </Grid>
                <Grid item xs={12}>
                       <TableContainer>
                          <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell>NAME</TableCell>
                                <TableCell>TAG</TableCell>
                                <TableCell>IMAGE ID</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {images.map((image) => (
                                <TableRow
                                  key={image.id}
                                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                  <TableCell component="th" scope="row">
                                    {image.repo}
                                  </TableCell>
                                  <TableCell>{image.tag}</TableCell>
                                  <TableCell>{image.id}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                </Grid>
            </Grid>
        </>
    );
}
