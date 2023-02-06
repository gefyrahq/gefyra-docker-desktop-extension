import { Button, Grid, TextField } from '@mui/material';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import store, { RootState } from '../store';
import { addVolumeMount, setVolumeMount, removeVolumeMount } from '../store/gefyra';

export function VolumeMounts() {
  const dispatch = useDispatch();
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const volumeMounts = useAppSelector((state) => state.gefyra.volumeMounts);

  const ddClient = createDockerDesktopClient();

  function handleAddVolumeMount() {
    dispatch(addVolumeMount({ host: '', container: '' }));
    console.log('handleAddVolumeMount');
  }

  async function handleHostVolumeMountChange(e, index, mode) {
    if (mode === 'host') {
      const result = await ddClient.desktopUI.dialog.showOpenDialog({
        properties: ['openDirectory', 'openFile']
      });
      if (!result.canceled) {
        const directory = result.filePaths.shift();
        if (directory !== undefined) {
          dispatch(
            setVolumeMount({
              volumeMount: {
                host: directory,
                container: store.getState().gefyra.volumeMounts[index].container
              },
              index: index
            })
          );
        }
      }
    } else {
      dispatch(
        setVolumeMount({
          volumeMount: {
            host: store.getState().gefyra.volumeMounts[index].host,
            container: e.target.value
          },
          index: index
        })
      );
    }
  }

  return (
    <>
      <Grid item xs={12}>
        {volumeMounts.map((v, index) =>
          v ? (
            <Grid container spacing={4} key={index} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <TextField
                  id="host"
                  variant="outlined"
                  fullWidth
                  label="Host Path"
                  InputProps={{ readOnly: true }}
                  onClick={(e) => handleHostVolumeMountChange(e, index, 'host')}
                  value={store.getState().gefyra.volumeMounts[index].host}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  id="container"
                  variant="outlined"
                  fullWidth
                  label="Container Path"
                  InputProps={{ readOnly: false }}
                  onChange={(e) => handleHostVolumeMountChange(e, index, 'container')}
                  value={store.getState().gefyra.volumeMounts[index].container}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => dispatch(removeVolumeMount(index))}>
                  X
                </Button>
              </Grid>
            </Grid>
          ) : (
            ''
          )
        )}
      </Grid>
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          component="label"
          color="primary"
          onClick={handleAddVolumeMount}>
          + Volume Mount
        </Button>
      </Grid>
    </>
  );
}
