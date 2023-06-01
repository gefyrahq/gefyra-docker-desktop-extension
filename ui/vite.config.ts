import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import svgrPlugin from 'vite-plugin-svgr';
import pjson from './package.json';

const SENTRY_AUTH_TOKEN = process.env.PRODUCTION_BUILD === 'true' ? fs.readFileSync('/run/secrets/SENTRY_AUTH_TOKEN', 'utf8') : '';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(),
  sentryVitePlugin({
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: SENTRY_AUTH_TOKEN,
    telemetry: false,
    debug: true,
    release: {
      name: pjson.version
    },
    sourcemaps: {
      assets: ['./build/*'],
    }
  }),],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: 3000
  },
  base: './',
  build: {
    outDir: 'build',
    sourcemap: true
  }
});
