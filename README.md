# gefyra-docker-desktop-extension


To build make sure to add executable from https://github.com/gefyrahq/gefyra-ext/ to root directory.

## Development

Make sure to follow Docker's extension guidelines: https://docs.docker.com/desktop/extensions-sdk/

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
