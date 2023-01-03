import { Card, CardContent, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { setMode, setView, setSteps, setActiveStep } from './store/ui';

type ModeProps = {
  image: FunctionComponent;
  imageAlt: string;
  headline: string;
  caption: string;
  mode: string;
  disabled?: boolean;
};

const steps = {
  run: [
    { label: 'Mode (Run)' },
    { label: 'Kubernetes Settings' },
    { label: 'Container Settings' },
    { label: 'Start Gefyra' },
    { label: 'Execute' }
  ],
  bridge: [
    { label: 'Mode (Bridge)' },
    { label: 'Kubernetes Settings' },
    { label: 'Container Settings' },
    { label: 'Start Gefyra' },
    { label: 'Execute' }
  ]
};

export function Mode(props: ModeProps) {
  const dispatch = useDispatch();
  function activateMode() {
    dispatch(setMode(props.mode));
    dispatch(setView('settings'));
    dispatch(setSteps(steps[props.mode]));
    dispatch(setActiveStep(1));
  }

  const styles = {
    px: 4,
    pt: 3,
    maxWidth: '80%',
    cursor: 'pointer',
    pointerEvents: props.disabled ? 'none' : 'default',
    opacity: props.disabled ? '0.5' : '1'
  };

  return (
    <>
      <Card sx={styles} onClick={activateMode}>
        <props.image />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {props.headline}
          </Typography>
          <Typography gutterBottom variant="body1" component="p">
            {props.caption}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
