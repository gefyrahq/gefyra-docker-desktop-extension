import { CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SelectProps } from '../types';

export function LSelect(props: SelectProps) {
  const loading = 'Loading';
  return (
    <FormControl fullWidth>
      <InputLabel id={props.labelId}>{props.label}</InputLabel>
      <Select
        labelId={props.labelId}
        id={props.id}
        label={props.label}
        value={props.loading ? 'loading' : props.value}
        onChange={props.handleChange}
        sx={{ minWidth: 300 }}
        disabled={props.disabled}>
        {props.items.length ? (
          props.items.map((item, index) => (
            <MenuItem key={item.value} value={item.value} disabled={index === 0}>
              {item.label}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="loading">
            <CircularProgress size={16} sx={{ mr: 1, mb: '-2px' }} />
            {props.loadingText ? props.loadingText : loading}
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
