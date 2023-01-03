import { CircularProgress, MenuItem, Select } from '@mui/material';
import { SelectProps } from '../types';

export function LSelect(props: SelectProps) {
  const loading = 'Loading';
  return (
    <Select
      labelId={props.labelId}
      id={props.id}
      value={props.loading ? 'loading' : props.value}
      label={props.label}
      onChange={props.handleChange}
      sx={{ minWidth: 300 }}
      disabled={props.disabled}>
      {props.items.length ? (
        props.items.map((item, index) => (
          <MenuItem
            key={item.value}
            value={item.value}
            disabled={index === 0 && item.value === 'select'}>
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
  );
}
