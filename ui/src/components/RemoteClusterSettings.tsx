import { Grid, InputLabel, TextField } from '@mui/material';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setHost, setPort } from '../store/gefyra';

export function RemoteClusterSettings() {
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  const dispatch = useDispatch();
  const host = useAppSelector((state) => state.gefyra.host);
  const port = useAppSelector((state) => state.gefyra.port);

  const handleHostChange = (e) => {
    dispatch(setHost(e.target.value));
  };
  const handlePortChange = (e) => {
    dispatch(setPort(e.target.value));
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={5}>
        <InputLabel sx={{ mb: 1 }} id="host-label">
          Host
        </InputLabel>
        <TextField
          id="host"
          variant="outlined"
          fullWidth
          size="small"
          value={host}
          onChange={handleHostChange}
        />
      </Grid>
      <Grid item xs={5}>
        <InputLabel sx={{ mb: 1 }} id="value-label">
          Port
        </InputLabel>
        <TextField
          id="port"
          variant="outlined"
          fullWidth
          size="small"
          value={port}
          type="number"
          inputProps={{ min: 0, max: 65535, inputMode: 'numeric' }}
          onChange={handlePortChange}
        />
      </Grid>
    </Grid>
  );
}
