import { Button, Grid, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { PortMapping, PortMappingsProps } from '../types';
import { useEffect, useState } from 'react';

const PORT_ERROR_MESSAGES = {
  'RANGE_ERROR': 'Port must be between 0 and 65535',
  'NAN_ERROR': 'Port must be a number',
  'DUPLICATE_ERROR': 'Port is already in use'
}

type PortError = {
  port1: string;
  port2: string;
}

export function PortMappings(props: PortMappingsProps) {
  const [errors, setErrors] = useState({} as { [key: number]: PortError });

  const dispatch = useDispatch();

  const add = () => {
    dispatch(props.add({ '': '' }));
  };

  useEffect(() => {
    if (Object.values(errors).some((e) => e.port1 !== '' || e.port2 !== '')) {
      props.isValid(false);
    } else {
      props.isValid(true);
    }
  }, [errors]);

  function validatePort(port: string, type: 'port1' | 'port2', i: number): void {
    const error: PortError = errors[i] || { port1: '', port2: '' };
    error[type] = '';
    if (isNaN(Number(port))) {
      error[type] = PORT_ERROR_MESSAGES['NAN_ERROR'];
      setErrors({ ...errors, [i]: error });
      return;
    }

    const portNumber = parseInt(port);
    if (!(portNumber >= 0 && portNumber <= 65535)) {
      error[type] = PORT_ERROR_MESSAGES['RANGE_ERROR'];
      setErrors({ ...errors, [i]: error });
      return;
    }

    const ports = props.state.map((p) => type === 'port1' ? Object.keys(p)[0] : Object.values(p)[0]);
    const first = ports.findIndex((p) => p === port);
    const last = ports.findLastIndex((p) => p === port);
    if (first !== last) {
      setErrors({ ...errors, [first]: error });  
      error[type] = PORT_ERROR_MESSAGES['DUPLICATE_ERROR'];
      setErrors({ ...errors, [last]: error });
      return;
    }

    setErrors({ ...errors, [i]: error });
  }

  function handleRemove(index: number) {
    const error = errors[index];
    if (error) {
      error.port1 = '';
      error.port2 = '';
      setErrors({ ...errors, [index]: error });
    }
    dispatch(props.remove(index))

  };

  function handleBlur(i: number, t: 'port1' | 'port2', value: string) {
    validatePort(value, t, i);
  }

  const handleChange = (i: number, t: 'port1' | 'port2', value: string) => {
    props.state.forEach((v: PortMapping, index) => {
      if (i === index) {
        const res: PortMapping = {};
        if (t === 'port1') {
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
                  error={errors[index]?.port1 !== ''}
                  helperText={errors[index]?.port1}
                  onChange={(e) => {
                    handleChange(index, 'port1', e.target.value);
                  }}
                  onBlur={(e) => {
                    handleBlur(index, 'port1', e.target.value);
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
                  error={errors[index]?.port2 !== ''}
                  helperText={errors[index]?.port2}
                  onChange={(e) => {
                    handleChange(index, 'port2', e.target.value);
                  }}
                  onBlur={(e) => {
                    handleBlur(index, 'port2', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="error"
                  disabled={props.loading}
                  onClick={() => {
                    handleRemove(index);
                  }}>
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
