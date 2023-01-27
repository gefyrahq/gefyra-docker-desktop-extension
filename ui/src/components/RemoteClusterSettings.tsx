import { FormControl, Grid, TextField } from '@mui/material';
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
        <FormControl fullWidth>
          <TextField
            id="host"
            label="Host"
            variant="outlined"
            fullWidth
            size="small"
            value={host}
            onChange={handleHostChange}
          />
        </FormControl>
      </Grid>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <TextField
            id="port"
            label="Port"
            variant="outlined"
            fullWidth
            size="small"
            value={port}
            type="number"
            inputProps={{ min: 0, max: 65535, inputMode: 'numeric' }}
            onChange={handlePortChange}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
