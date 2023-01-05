#syntax=docker/dockerfile:1.3-labs

FROM alpine AS dl
WORKDIR /tmp
RUN apk add --no-cache wget unzip
ARG TARGETARCH
ARG GEFYRA_EXT_RELEASE

RUN wget -qO- https://api.github.com/repos/gefyrahq/gefyra-ext/releases/tags/${GEFYRA_EXT_RELEASE} | grep browser_download_url | cut -d '"' -f 4 | wget -qi -
RUN mkdir /windows
RUN mkdir /darwin
RUN mkdir /linux
# unzip windows files
RUN unzip gefyra-${GEFYRA_EXT_RELEASE}-windows-x86_64.zip -d /windows 
# unzip mac files
RUN unzip gefyra-${GEFYRA_EXT_RELEASE}-darwin-universal.zip -d /darwin 
# unzip linux files
RUN unzip gefyra-${GEFYRA_EXT_RELEASE}-linux-amd64.zip -d /linux 

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
RUN npm run build
# ARG RELEASE

# ARG SENTRY_AUTH_TOKEN
#ARG SENTRY_DSN
#ARG SENTRY_URL
#ARG SENTRY_ORG
#ARG SENTRY_PROJECT
# TODO add Docker secret to add env variables
# RUN if [[ -z "$RELEASE" ]] ; then echo No release, continuing. ; else npm install @sentry/cli && ./node_modules/.bin/sentry-cli releases new ${RELEASE} && ./node_modules/.bin/sentry-cli releases files ${RELEASE} upload-sourcemaps /ui/build/js && ./node_modules/.bin/sentry-cli releases finalize ${RELEASE} ; fi


FROM alpine
LABEL org.opencontainers.image.title="gefyra-docker-extension" \
    org.opencontainers.image.description="Gefyra's Docker extension to bridge running containers into Kubernetes clusters." \
    org.opencontainers.image.vendor="Blueshoe GmbH" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="https://gefyra.dev" \
    com.docker.extension.additional-urls="[{\"title\":\"Documentation\",\"url\":\"https://gefyra.dev\"}, {\"title\":\"Github\",\"url\":\"https://github.com/gefyrahq/gefyra/\"}]" \
    com.docker.extension.changelog=""\
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/gefyrahq/gefyra-docker-desktop-extension/main/gefyra_icon.svg" \
    com.docker.extension.categories="cloud-development,kubernetes,testing-tools,container-orchestration"

COPY metadata.json .
COPY gefyra_icon.svg .

RUN mkdir /windows
RUN mkdir /darwin
RUN mkdir /linux

COPY --from=client-builder /ui/build ui
COPY --from=client-builder /ui/public ui/public
COPY --from=dl /windows/dist/ /windows
COPY --from=dl /darwin/gefyra-json /darwin
COPY --from=dl /linux/gefyra-json /linux

CMD [ "sleep", "infinity" ]

