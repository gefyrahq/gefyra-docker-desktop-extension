#syntax=docker/dockerfile:1.3-labs

FROM alpine AS dl
WORKDIR /tmp
RUN apk add --no-cache wget unzip
ARG TARGETARCH
ARG GEFYRA_EXT_RELEASE
RUN <<EOT ash
    wget -qO- https://api.github.com/repos/gefyrahq/gefyra-ext/releases/tags/${GEFYRA_EXT_RELEASE} | grep browser_download_url | cut -d '"' -f 4 | wget -qi -
    mkdir /windows
    mkdir /darwin
    mkdir /linux
    # unzip windows files
    unzip -j gefyra-${GEFYRA_EXT_RELEASE}-windows-x86_64.zip -d /windows 
    # unzip mac files
    unzip -j gefyra-${GEFYRA_EXT_RELEASE}-darwin-universal.zip -d /darwin 
    # unzip linux files
    unzip -j gefyra-${GEFYRA_EXT_RELEASE}-linux-amd64.zip -d /linux 
EOT

FROM --platform=$BUILDPLATFORM node:17.7-alpine3.14 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
COPY ui/node_modules/gefyra /ui/node_modules/gefyra
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="gefyra-docker-extension" \
    org.opencontainers.image.description="Gefyra's Docker extension to bridge running containers into Kubernetes clusters." \
    org.opencontainers.image.vendor="Blueshoe GmbH" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

COPY docker-compose.yaml .
COPY metadata.json .
COPY gefyra_icon.svg .

RUN mkdir /windows
RUN mkdir /darwin
RUN mkdir /linux

COPY --from=client-builder /ui/build ui
COPY --from=dl /windows/gefyra-json.exe /windows
COPY --from=dl /darwin/gefyra-json /darwin
COPY --from=dl /linux/gefyra-json /linux

CMD [ "sleep", "infinity" ]

