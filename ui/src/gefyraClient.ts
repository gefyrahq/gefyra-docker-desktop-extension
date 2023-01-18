import { DockerDesktopClient } from '@docker/extension-api-client-types/dist/v1';
import { GefyraBaseClient } from 'gefyra/lib/base';
import { GefyraRequest } from 'gefyra/lib/protocol';
import * as Sentry from '@sentry/browser';

class Gefyra extends GefyraBaseClient {
  client: DockerDesktopClient;

  constructor(dockerClient: DockerDesktopClient) {
    super();
    this.client = dockerClient;
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
      this.client.extension.host.cli.exec('gefyra-json', [request.serialize()], {
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
