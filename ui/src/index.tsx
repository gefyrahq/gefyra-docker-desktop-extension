import * as Sentry from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';

import { App } from './App';
import { Provider } from 'react-redux';
import store from './store';

if (process.env.NODE_ENV !== 'production') {
  console.log('init sentry');
  Sentry.init({
    dsn: 'https://11cee47c7bdd4a2a91e211b2119cb8fb@sentry.unikube.io/6',
    release: process.env.REACT_APP_VERSION
  });
  Sentry.setTag('user', 'docker-desktop');
  Sentry.setContext('user', {});
}

ReactDOM.render(
  <React.StrictMode>
    {/*
      If you eject from MUI (which we don't recommend!), you should add
      the `dockerDesktopTheme` class to your root <html> element to get
      some minimal Docker theming.
    */}
    <DockerMuiThemeProvider>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </DockerMuiThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
