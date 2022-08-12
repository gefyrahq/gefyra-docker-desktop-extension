import { v1 } from '@docker/extension-api-client-types';

class Kubectl {
    private ddClient: v1.DockerDesktopClient;

    public constructor(ddClient: v1.DockerDesktopClient) {
        this.ddClient = ddClient;
    }

    async getContexts(): Promise<string[]> {
        return new Promise((resolve, reject) => {
          this.ddClient.extension?.host?.cli.exec("kubectl", ["config", "view", "-o", "jsonpath='{.contexts[*].name}'"], {
            stream: {
              onOutput(data): void {
                if (data.stdout) {
                  console.log(data.stdout);
                  resolve(data.stdout.replaceAll("'", "").split(" "));
                } else {
                  console.log(data.stderr);
                }
              },
              onError(error: any): void {
                console.error(error);
              },
            },
          });
        });
    }

    async getNamespaces(ctx: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
          this.ddClient.extension?.host?.cli.exec("kubectl", ["--context", ctx, "get", "ns", "-o", "jsonpath='{.items[*].metadata.name}'"], {
            stream: {
              onOutput(data): void {
                if (data.stdout) {
                  console.log(data.stdout);
                  resolve(data.stdout.replaceAll("'", "").split(" "));
                } else {
                  console.log(data.stderr);
                }
              },
              onError(error: any): void {
                console.error(error);
              },
            },
          });
        });
    }
}

    
export { Kubectl }