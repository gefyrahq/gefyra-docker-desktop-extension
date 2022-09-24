#syntax=docker/dockerfile:1.3-labs

FROM alpine AS dl
WORKDIR /tmp
RUN apk add --no-cache curl tar
ARG TARGETARCH
# RUN <<EOT ash
#     mkdir -p /out/darwin
#     curl -fSsLo /out/darwin/kubectl "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/darwin/${TARGETARCH}/kubectl"
#     chmod a+x /out/darwin/kubectl
# EOT
# RUN <<EOT ash
#     if [ "amd64" = "$TARGETARCH" ]; then
#         mkdir -p /out/windows
#         curl -fSsLo /out/windows/kubectl.exe "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe"
#     fi
# EOT

FROM alpine
LABEL org.opencontainers.image.title="example-extension" \
    org.opencontainers.image.description="My Example Extension" \
    org.opencontainers.image.vendor="Docker Inc." \
    com.docker.desktop.extension.api.version=">= 0.1.0"

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
COPY gefyra-json ./gefyra-json
RUN chmod u+x gefyra-json
COPY --from=client-builder /ui/build ui
# COPY --from=dl /out /

CMD [ "sleep", "infinity" ]

