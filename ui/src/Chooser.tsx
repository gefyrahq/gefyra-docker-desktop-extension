import { Grid, Typography, useMediaQuery } from '@mui/material';
import { Mode } from './Mode';
import { ReactComponent as RunLightSVG } from './assets/run_light.svg';
import { ReactComponent as RunDarkSVG } from './assets/run_dark.svg';
import { ReactComponent as BridgeDarkSVG } from './assets/bridge_dark.svg';
import { ReactComponent as BridgeLightSVG } from './assets/bridge_light.svg';

export function Chooser() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const RunSVG = prefersDarkMode ? RunDarkSVG : RunLightSVG;
  const BridgeSVG = prefersDarkMode ? BridgeDarkSVG : BridgeLightSVG;

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Please select Gefyra&lsquo;s operation mode.</Typography>
      </Grid>
      <Grid item xs={6}>
        <Mode
          image={RunSVG}
          imageAlt="Run container in Kubernetes"
          headline="Run Container in Kubernetes"
          caption="Run a local container as new workload in a Kubernetes cluster."
          mode="run"
        />
      </Grid>
      <Grid
        sx={{ position: 'relative' }}
        item
        xs={6}
        onClick={() => alert('Bridge is not available yet.')}>
        <Mode
          image={BridgeSVG}
          imageAlt="Bridge container in Kubernetes"
          headline="Bridge Container to Kubernetes will be available soon!"
          caption=""
          mode="bridge"
          disabled
        />
      </Grid>
    </>
  );
}
