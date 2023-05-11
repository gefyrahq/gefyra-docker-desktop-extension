<div align="center">
    <img src="https://github.com/gefyrahq/gefyra/raw/main/docs/static/img/logo.png" alt="Gefyra Logo"/>
    <h3 align="center">Gefyra Docker Desktop Extension</h3>
    <p align="center">
        Connect your local containers to any Kubernetes cluster.
    </p>
    <img src="https://github.com/gefyrahq/gefyra-docker-desktop-extension/raw/main/assets/screenshot.png" alt="Screenshot Gefyra Docker Desktop Extension"/>
</div>

[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/8NTPMVPaKy)

Gefyra aims to ease the burdens of K8s based development for developers.
Run a container locally and connect it to a Kubernetes cluster to:

 - talk to other services
 - let other services talk to your local container
 - debug
 - faster iterations - no build/push/deploy/repeat

 ## How does this extension work?

The extension uses [gefyra-ext](https://github.com/gefyrahq/gefyra-ext) which is basically a wrapper around [Gefyra](https://github.com/gefyrahq/gefyra)
itself. It allows leverage Gefyra as a libary and takes JSON strings as an input, which makes it easy for JS/TS based programs to use Gefyra. 

The Docker Desktop extension comes with a packed binary ('gefyra-ext') and builds an UI on top of it.

## Installation

Gefyra is available on the Docker Desktop extension [marketplace](https://hub.docker.com/extensions/gefyra/docker-desktop-extension).

You can also install via command line:

```bash
docker extension install gefyra/docker-desktop-extension:latest
```

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

## Bump gefyra-ext
Just bump the `gefyra` package in the `ui/package.json` file (via `npm`).
Rebuild the extension - it references the version found in the package file and will download
the corresponding binary files.

### Windows Binary
The windows binary for `gefyra-ext` consists out of many files. These files need to be 
present in `metadata.json` under the `host.binaries.windows` key.
To make sure the file list and actual files in the Docker image are consistant use following command from the Makefile:

```sh
make update-windows-file-list
```

This command is also used in the CI when building a new image. 
In case the `metadata.json` file is changed the CI job for building an image fails.

## Release

1. Bump package.json (`npm version`)
2. Commit + Tag
3. Release on Github
