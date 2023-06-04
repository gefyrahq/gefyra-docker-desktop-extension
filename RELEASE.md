# Release Hints


## Automatic
1. Run Github Workflow [Release & Publish on Docker Hub](https://github.com/gefyrahq/gefyra-docker-desktop-extension/actions/workflows/release.yaml).
2. Once finished it prints a link to create a new release on GitHub.
3. Generate release notes and publish.

## Manual

To release a new version of the extension, follow these steps:

1. Bump package.json (`npm version patch|minor|major`)
2. Commit + Tag
3. Push to GitHub
4. Create a new release on GitHub
5. Wait for the CI to build the extension and publish it to the Docker Hub
