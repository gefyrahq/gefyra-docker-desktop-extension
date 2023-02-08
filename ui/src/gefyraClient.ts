import { DockerDesktopClient, ExecProcess } from '@docker/extension-api-client-types/dist/v1';
import { GefyraBaseClient } from 'gefyra/lib/base';
import { GefyraRequest } from 'gefyra/lib/protocol';
import * as Sentry from '@sentry/react';

class Gefyra extends GefyraBaseClient {
  client: DockerDesktopClient;
  process: ExecProcess;

  constructor(dockerClient: DockerDesktopClient) {
    super();
    this.client = dockerClient;
    this.process = null;
  }

  cancel(): void {
    if (this.process) {
      this.process.close();
    }
  }

  async exec(request: GefyraRequest): Promise<any> {
    const host = this.client.host;
    Sentry.setTag('action', request.action);
    Sentry.setTag('os', host.platform);
    Sentry.setTag('arch', host.arch);
    Sentry.setTag('uuid', window.localStorage.getItem('trackingId'));
    Sentry.captureMessage('geyfra-ext action');
    console.debug(request);

    return new Promise((resolve, reject) => {
      this.process = this.client.extension.host.cli.exec('gefyra-json', [request.serialize()], {
        stream: {
          onOutput(data): void {
            if (data.stdout) {
              resolve(data.stdout);
            } else {
              Sentry.captureMessage('geyfra-ext action failed');
            }
          },
          onError(error: any): void {
            console.error(error);
            reject(error);
          },
          onClose(exitCode: number): void {
            console.debug('onClose with exit code ' + exitCode);
          }
        }
      });
    });
  }
}

export { Gefyra };
