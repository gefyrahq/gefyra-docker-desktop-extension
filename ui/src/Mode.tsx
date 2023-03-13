import { Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { setMode, setView, setSteps, setActiveStep } from './store/ui';

type ModeProps = {
  image: FunctionComponent;
  imageAlt: string;
  headline: string;
  caption: string;
  mode: 'run' | 'bridge';
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
  const theme = useTheme();

  const styles = {
    px: 4,
    pt: 3,
    maxWidth: '80%',
    height: '100%',
    cursor: 'pointer',
    pointerEvents: props.disabled ? 'none' : 'default',
    opacity: props.disabled ? '0.5' : '1',
    'z-index': 1
  };

  const soonStyle = {
    // rotate by 45 degrees on the card
    transform: 'rotate(45deg)',
    // move the text down by 50% of its height
    position: 'absolute',
    top: '40%',
    opacity: 1,
    'z-index': 1000,
    // move the text left by 50% of its width
    left: '20%',
    color: theme.palette.error.main,
    // hide the text overflow
    overflow: 'hidden'
  };

  return (
    <>
      {props.disabled && (
        <Typography sx={soonStyle} gutterBottom variant="h1" component="div">
          Coming soon
        </Typography>
      )}
      <Card sx={styles} onClick={activateMode}>
        <props.image />
        <CardContent sx={{ position: 'relative' }}>
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
