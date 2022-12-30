import { ReactComponent as LogoLight } from './assets/gefyra_horizontal.svg';
import { ReactComponent as LogoDark } from './assets/gefyra_horizontal_dark.svg';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Button, Grid, Typography, useMediaQuery } from '@mui/material';

export function TopBar() {
  const docker = createDockerDesktopClient();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  function githubLink(e) {
    docker.host.openExternal('https://github.com/gefyrahq/gefyra');
  }

  function githubExtensionLink(e) {
    docker.host.openExternal('https://github.com/gefyrahq/gefyra-docker-desktop-extension/issues');
  }
  return (
    <Grid container>
      <Grid item xs={8}>
        {prefersDarkMode ? (
          <LogoDark width="200" height="60" />
        ) : (
          <LogoLight width="200" height="60" />
        )}
      </Grid>
      <Grid item xs={4} textAlign="right" alignSelf={'flex-end'}>
        <Button sx={{ marginRight: 2 }} variant="contained" onClick={githubExtensionLink}>
          Report an Issue
        </Button>
        <Button variant="contained" onClick={githubLink}>
          Github
        </Button>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: 1 }}>
        <Typography variant="body1" fontWeight={600}>
          Run local containers in Kubernetes environments.
        </Typography>
      </Grid>
    </Grid>
  );
}
