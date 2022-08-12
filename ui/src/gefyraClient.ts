import {DockerDesktopClient} from '@docker/extension-api-client-types/dist/v1';


class Gefyra {
    client: DockerDesktopClient

    constructor(dockerClient: DockerDesktopClient) {
        this.client = dockerClient
    }

    version(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.extension.host.cli.exec("gefyra_mac", ["version"], {
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
              },
            });
        })
    }
}

export { Gefyra }
