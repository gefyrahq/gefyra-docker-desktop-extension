import { ReactComponent as LogoLight } from './assets/gefyra_horizontal.svg';
import { ReactComponent as LogoDark } from './assets/gefyra_horizontal_dark.svg';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Grid, Link, Typography, useMediaQuery } from '@mui/material';
import { Gefyra } from './gefyraClient';
import { GefyraListRequest, GefyraResponse } from 'gefyra/lib/protocol';
import { useState } from 'react';

export function TopBar() {
  const docker = createDockerDesktopClient();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [apiVersion, setApiVersion] = useState('');

  function discordLink() {
    docker.host.openExternal('https://discord.gg/8NTPMVPaKy');
  }

  const gefyra_api_version = '';

  const ddClient = createDockerDesktopClient();
  const gefyraClient = new Gefyra(ddClient);
  const helpRequest = new GefyraListRequest();
  gefyraClient.exec(helpRequest).then((res: string) => {
    const v = JSON.parse(res);
    setApiVersion(v.apiVersion as string);
  });

  function githubExtensionLink() {
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
      <Grid item xs={4} sx={{ pt: 1 }} textAlign="right" alignSelf={'flex-end'}>
        <div>
          <Link href="#" onClick={discordLink}>
            Join our Discord
          </Link>
        </div>
        <div>
          Feel free to report any{' '}
          <Link href="#" onClick={githubExtensionLink}>
            issues
          </Link>
        </div>
        <div>
          Version: <span>{APP_VERSION} | API: {apiVersion}</span>
        </div>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: 1 }}>
        <Typography variant="body1" fontWeight={600}>
          Run local containers in Kubernetes environments.
        </Typography>
      </Grid>
    </Grid>
  );
}
