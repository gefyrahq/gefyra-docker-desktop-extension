import * as Sentry from '@sentry/react';
import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';

import { App } from './App';
import { Provider } from 'react-redux';
import store from './store';
import pjson from '../package.json';
Sentry.init({
  dsn: 'https://11cee47c7bdd4a2a91e211b2119cb8fb@sentry.unikube.io/6',
  release: pjson.version,
  environment: process.env.NODE_ENV,
  integrations: (integrations) => {
    return integrations.filter((integration) => {
      return integration.name !== 'Dedupe';
    });
  },
  beforeSend(event) {
    if (event.user) {
      delete event.user;
    }
    if (event.request) {
      delete event.request;
    }
    Sentry.setTag('user', 'docker-desktop');
    Sentry.setTag('url', '');
    Sentry.setContext('user', {});
    return event;
  }
});
const rootEle = document.getElementById('root');

if (rootEle) {
  const root = ReactDOMClient.createRoot(rootEle);

  root.render(
    <React.StrictMode>
      <DockerMuiThemeProvider>
        <CssBaseline />
        <Provider store={store}>
          <App />
        </Provider>
      </DockerMuiThemeProvider>
    </React.StrictMode>
  );
}
