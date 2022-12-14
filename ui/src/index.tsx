import * as Sentry from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';

import { App } from './App';
import { Provider } from 'react-redux';
import store from './store';

Sentry.init({
  dsn: 'https://11cee47c7bdd4a2a91e211b2119cb8fb@sentry.unikube.io/6',
  release: process.env.REACT_APP_VERSION,
  environment: process.env.NODE_ENV,
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

ReactDOM.render(
  <React.StrictMode>
    <DockerMuiThemeProvider>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </DockerMuiThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
