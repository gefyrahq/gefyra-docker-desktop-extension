import { v1 } from '@docker/extension-api-client-types';

class Kubectl {
    private ddClient: v1.DockerDesktopClient;

    public constructor(ddClient: v1.DockerDesktopClient) {
        this.ddClient = ddClient;
    }

    async getContexts(kubeconfig): Promise<{error: boolean, value: string|string[]}> {
        const args = ["config", "view", "-o", "jsonpath='{.contexts[*].name}'"]
        if (kubeconfig) {
            args.push("--kubeconfig")
            args.push(kubeconfig)
        }
        console.log(args)
        return new Promise((resolve, reject) => {
          this.ddClient.extension?.host?.cli.exec("kubectl", args, {
            stream: {
              onOutput(data): void {
                if (data.stdout) {
                  console.log(data.stdout);
                  if (data.stdout) {
                      const result = data.stdout
                          .replaceAll("'", "").split(" ")
                          // .map((c) => {
                          //     const split = c.split("@")
                          //     if (split.length > 1) {
                          //         return split[1]
                          //     }
                          //     return split[0]
                          // })
                      resolve({
                          error: false,
                          value: result
                      })
                  } else {
                      resolve({
                          error: true,
                          value: 'No context found. Please check file path.'
                      });
                  }
                } else {
                  resolve({
                      error: true,
                      value: data.stderr
                  })
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

    async getNamespaces(ctx: string, kubeconfig?: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
          const args = ["--context", ctx, "get", "ns", "-o", "jsonpath='{.items[*].metadata.name}'"];
          if (kubeconfig) {
            args.push("--kubeconfig")
            args.push(kubeconfig)
          }
          this.ddClient.extension?.host?.cli.exec("kubectl", args, {
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
