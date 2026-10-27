FROM node:20-alpine as build
WORKDIR /app
# The lockfile's pnpm. Latest (v11 in 2026-10) refuses to install: it skips
# the build scripts of sharp, pngquant-bin and grpc-tools unless approved
RUN corepack enable && corepack prepare pnpm@8.10.0 --activate
COPY . /app/
RUN pnpm install
RUN pnpm run proto
RUN pnpm run build
RUN pnpm prune --prod
RUN pnpm dlx modclean modclean -r


FROM alpine:3.18 as prod
# Nodejs-current is 20.X.
RUN apk add --no-cache icu-data-full nodejs-current upx curl ca-certificates ffmpeg ttf-liberation && upx --best --lzma /usr/bin/node && apk del upx
WORKDIR /app
COPY --from=build /app/dist/                        /app
COPY --from=build /app/node_modules                 /node_modules

CMD ["node", "/app/server.js"]
