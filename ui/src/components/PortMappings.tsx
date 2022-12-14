import { Button, Grid, InputLabel, TextField } from '@mui/material';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { removePortMapping, addPortMapping, setPortMapping } from '../store/gefyra';
import { PortMapping } from '../types';

export function PortMappings() {
  const dispatch = useDispatch();
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

  const portMappings = useAppSelector((state) => state.gefyra.portMappings);

  const add = (e) => {
    dispatch(addPortMapping({ '': '' }));
  };

  const handleChange = (i, t, value) => {
    portMappings.forEach((v: PortMapping, index) => {
      if (i === index) {
        const res = {};
        if (t === 'host') {
          res[value] = v[Object.keys(v)[0]];
        } else {
          res[Object.keys(v)[0]] = value;
        }
        dispatch(setPortMapping({ ports: res, index: index }));
      }
      return v;
    });
  };

  return (
    <>
      {portMappings.map((ports, index) =>
        ports ? (
          <Grid item xs={12} key={index}>
            <Grid container spacing={4}>
              <Grid item xs={5}>
                <InputLabel sx={{ mb: 1 }} id="host-label">
                  Host
                </InputLabel>
                <TextField
                  id={'hostLabel' + index}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={Object.keys(ports)[0]}
                  onChange={(e) => {
                    handleChange(index, 'host', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <InputLabel sx={{ mb: 1 }} id="container-label">
                  Container
                </InputLabel>
                <TextField
                  id={'containerValueValue' + index}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={ports[Object.keys(ports)[0]]}
                  onChange={(e) => {
                    handleChange(index, 'container', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 4 }}
                  onClick={() => dispatch(removePortMapping(index))}>
                  X
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          ''
        )
      )}
      <Grid item xs={12}>
        <Button variant="contained" component="label" color="primary" onClick={add}>
          + Port Mapping
        </Button>
      </Grid>
    </>
  );
}
