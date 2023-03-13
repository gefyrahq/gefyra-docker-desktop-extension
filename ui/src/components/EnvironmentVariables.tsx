import { Button, Grid, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setEnvironmentVariables } from '../store/gefyra';
import { EnvironmentVariable } from '../types';

export function EnvironmentVariables() {
  const dispatch = useDispatch();
  const [variables, setVariables] = useState(
    JSON.parse(localStorage.getItem('environmentVariables') || '') || []
  );

  useEffect(() => {
    dispatch(setEnvironmentVariables(variables));
  }, [variables, dispatch]);

  function addVariable() {
    setVariables((old: object) => {
      return [...old, { label: '', value: '' }];
    });
  }

  const handleChange = (i: number, t: 'label' | 'value', value: string) => {
    const newEnvironment = variables.map((v: EnvironmentVariable, index: number) => {
      if (index === i) {
        const n = { label: '', value: '' };
        n[t] = value;
        if (t === 'label') {
          n.value = v.value;
        } else {
          n.label = v.label;
        }
        return n;
      }
      return v;
    });
    setVariables(newEnvironment);
  };

  return (
    <>
      {variables.map((v: EnvironmentVariable, index: number) =>
        v ? (
          <Grid item xs={12} key={index}>
            <Grid container spacing={4}>
              <Grid item xs={5}>
                <TextField
                  id={'variableLabel' + index}
                  variant="outlined"
                  fullWidth
                  label="Name"
                  size="small"
                  value={v.label}
                  onChange={(e) => {
                    handleChange(index, 'label', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  id={'variableValue' + index}
                  variant="outlined"
                  fullWidth
                  label="Value"
                  size="small"
                  value={v.value}
                  onChange={(e) => {
                    handleChange(index, 'value', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setVariables(variables.filter((v, i) => i !== index))}>
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
        <Button variant="contained" component="label" color="primary" onClick={addVariable}>
          + Environment Variable
        </Button>
      </Grid>
    </>
  );
}
