import { LinearProgress } from '@mui/material';
import { GefyraStatusBarProps } from '../types';

export function GefyraStatusBar(props: GefyraStatusBarProps) {
  return (
    <>
      <p>{props.label}</p>
      <LinearProgress
        variant="determinate"
        color={props.error ? 'error' : 'primary'}
        value={props.progress}
      />
    </>
  );
}
