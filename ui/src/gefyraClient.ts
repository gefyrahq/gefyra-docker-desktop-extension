import {DockerDesktopClient} from '@docker/extension-api-client-types/dist/v1';
import { GefyraBaseClient } from 'gefyra/lib/base';
import { GefyraRequest } from 'gefyra/lib/protocol';


class Gefyra extends GefyraBaseClient {
    client: DockerDesktopClient

    constructor(dockerClient: DockerDesktopClient) {
        super()
        this.client = dockerClient
    }

    protected async exec(request: GefyraRequest): Promise<string> {
      return new Promise((resolve, reject) => {
        this.client.extension.host.cli.exec("gefyra-json", [request.serialize()], {
          stream: {
            onOutput(data): void {
              if (data.stdout) {
                resolve(data.stdout)
              } else {
                console.log(data.stderr);
              }
            },
            onError(error: any): void {
              console.error(error);
            },
            onClose(exitCode: number): void {
              console.log("onClose with exit code " + exitCode);
            },
          }
        })
      })
    }
}

export { Gefyra }