import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from "@sentry/vite-plugin";
import svgrPlugin from 'vite-plugin-svgr';
import pjson from './package.json';

const SENTRY_AUTH_TOKEN = fs.readFileSync('/run/secrets/SENTRY_AUTH_TOKEN', 'utf8');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(),
  sentryVitePlugin({
    include: ".",
    ignore: ["node_modules", "vite.config.ts"],
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    url: process.env.SENTRY_URL,
    authToken: SENTRY_AUTH_TOKEN,
    telemetry: false,
    release: pjson.version,
    dryRun: process.env.PRODUCTION_BUILD !== 'true'
  }),],
  server: {
    port: 3000
  },
  base: './',
  build: {
    outDir: 'build',
    sourcemap: true
  }
});
