# Gefyra Docker Desktop Extension

**Connect your local containers to any Kubernetes cluster.**

Gefyra aims to ease the burdens of K8s based development for developers.
Run a container locally and connect it to a Kubernetes cluster to:

 - talk to other services
 - let other services talk to your local container
 - debug
 - faster iterations - no build/push/deploy/repeat

## Development
To build make sure to add executable from https://github.com/gefyrahq/gefyra-ext/ to root directory.

Make sure to follow Docker's extension guidelines: https://docs.docker.com/desktop/extensions-sdk/
UI component library: https://mui.com/

Install extension:

```bash
make install-extension
```

Run hot reload webpack server for UI:
```bash
cd ui/
npm run start
```

Connect webpack server to Gefyra Docker Desktop extension:
```bash
docker extension dev ui-source gefyra/docker-desktop-extension:latest http://localhost:3000
```

Make Chrome devtools available:
```bash
docker extension dev debug gefyra/docker-desktop-extension:latest
```
