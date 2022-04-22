FROM --platform=${TARGETPLATFORM:-linux/amd64} ghcr.io/openfaas/of-watchdog:0.9.3 as watchdog

# Takes node 17 image (170MB) and tries to reduce it as much as possible
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:17-alpine as build
# Remove npm
RUN rm -f /usr/local/lib/node_modules/npm && rm -f /usr/local/bin/npm /usr/local/bin/npx
# UPX node
RUN apk add --no-cache upx && upx --best --lzma /usr/local/bin/node && apk del upx

# Copy reduced node into a brand new image and continue like normal
FROM alpine:latest as  ship
COPY --from=build /usr/lib /usr/lib
COPY --from=build /usr/local/share /usr/local/share
COPY --from=build /usr/local/lib /usr/local/lib
COPY --from=build /usr/local/include /usr/local/include
COPY --from=build /usr/local/bin /usr/local/bin
COPY --from=build /opt /opt

ARG TARGETPLATFORM
ARG BUILDPLATFORM

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

RUN apk --no-cache add curl ca-certificates ffmpeg ttf-liberation \
    && addgroup -S app && adduser -S -g app app

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

RUN chmod 777 /tmp && yarn set version berry

USER app

RUN mkdir -p /home/app/function

# Wrapper/boot-strapper
WORKDIR /home/app
COPY package.json .yarnrc.yml ./

# This ordering means the npm installation is cached for the outer function handler.
RUN touch yarn.lock && yarn install

# Copy outer function handler
COPY index.js ./

# COPY function node packages and install, adding this as a separate
# entry allows caching of npm install

WORKDIR /home/app/function
COPY function/*.json function/*.lock ./

RUN yarn plugin import workspace-tools && yarn workspaces focus --all --production

# COPY function files and folders
COPY function/ ./


# Set correct permissions to use non root user
WORKDIR /home/app/

ENV cgi_headers="true"
ENV fprocess="node index.js"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"

ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"

ENV prefix_logs="false"

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
