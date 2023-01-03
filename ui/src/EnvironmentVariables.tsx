import { Button, Grid, InputLabel, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setEnvironmentVariables } from './store/gefyra';
import { EnvironmentVariable } from './types';

export function EnvironmentVariables() {
  const dispatch = useDispatch();
  const [variables, setVariables] = useState(
    JSON.parse(localStorage.getItem('environmentVariables')) || []
  );

  useEffect(() => {
    dispatch(setEnvironmentVariables(variables));
  }, [variables, dispatch]);

  function addVariable() {
    setVariables((old) => {
      return [...old, { label: '', value: '' }];
    });
  }

  const handleChange = (i, t, value) => {
    const newEnvironment = variables.map((v: EnvironmentVariable, index) => {
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
      {variables.map((v, index) =>
        v ? (
          <Grid item xs={12} key={index}>
            <Grid container spacing={4}>
              <Grid item xs={5}>
                <InputLabel sx={{ mb: 1 }} id="variable-label">
                  Name
                </InputLabel>
                <TextField
                  id={'variableLabel' + index}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={v.label}
                  onChange={(e) => {
                    handleChange(index, 'label', e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <InputLabel sx={{ mb: 1 }} id="value-label">
                  Value
                </InputLabel>
                <TextField
                  id={'variableValue' + index}
                  variant="outlined"
                  fullWidth
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
                  sx={{ mt: 4 }}
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
      <Grid item xs={12}>
        <Button variant="contained" component="label" color="primary" onClick={addVariable}>
          + Environment Variable
        </Button>
      </Grid>
    </>
  );
}
