import { Button, Grid, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { PortMapping, PortMappingsProps } from '../types';

export function PortMappings(props: PortMappingsProps) {
  const dispatch = useDispatch();

  const add = () => {
    dispatch(props.add({ '': '' }));
  };

  const handleChange = (i: number, t: 'host' | 'container', value: string) => {
    props.state.forEach((v: PortMapping, index) => {
      if (i === index) {
        const res: PortMapping = {};
        if (t === 'host') {
          res[value] = v[Object.keys(v)[0]];
        } else {
          res[Object.keys(v)[0]] = value;
        }
        dispatch(props.set({ ports: res, index: index }));
      }
      return v;
    });
  };

  return (
    <>
      {props.state.map((ports, index) =>
        ports ? (
          <Grid item xs={12} key={index} sx={{ mb: 2 }}>
            <Grid container spacing={4}>
              <Grid item xs={5}>
                <TextField
                  id={'hostLabel' + index}
                  variant="outlined"
                  fullWidth
                  label="Host"
                  size="small"
                  value={Object.keys(ports)[0]}
                  disabled={props.loading}
                  onChange={(e) => {
                    handleChange(index, 'host', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  id={'containerValueValue' + index}
                  variant="outlined"
                  fullWidth
                  label="Container"
                  size="small"
                  value={ports[Object.keys(ports)[0]]}
                  disabled={props.loading}
                  onChange={(e) => {
                    handleChange(index, 'container', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="error"
                  disabled={props.loading}
                  onClick={() => dispatch(props.remove(index))}>
                  X
                </Button>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          ''
        )
      )}
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Button variant="contained" component="label" color="primary" onClick={add} disabled={props.loading}>
          + Port Mapping
        </Button>
      </Grid>
    </>
  );
}
