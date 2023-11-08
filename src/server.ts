import "reflect-metadata";
import {
  sendUnaryData,
  Server,
  ServerCredentials,
  ServerUnaryCall,
} from "@grpc/grpc-js";
import { container } from "./inversify.config.js";
import { TYPES } from "./types.js";
import { IThumbnailGenerator } from "./pkg/thumbnail-generator/thumbnail-generator-api.js";
import { basename } from "path";
import { IObjectStore } from "./internal/object-store/objet-store-api.js";
import { thumbnail } from "./proto/thumbnail.js";
import { fontPath } from "./utils/resources.js";
import ThumbnailRequest = thumbnail.ThumbnailRequest;
import ThumbnailResponse = thumbnail.ThumbnailResponse;
import UnimplementedThumbnailService = thumbnail.UnimplementedThumbnailService;
import { ILogger } from "./internal/logger/logger-api.js";

const server = new Server();
const PORT = 50051;
const store = container.get<IObjectStore>(TYPES.ObjectStore);
const logger = container.get<ILogger>(TYPES.Logger);

async function createThumbnail(
  call: ServerUnaryCall<ThumbnailRequest, ThumbnailResponse>,
  callback: sendUnaryData<ThumbnailResponse>,
) {
  const gen = container.get<IThumbnailGenerator>(TYPES.ThumbnailGenerator);
  logger.info(
    `Received new request with params ` +
      JSON.stringify(call.request.toObject()),
  );
  const args = {
    gmsAvatarUrl: call.request.gmsAvatarUrl,
    title: call.request.title,
    episodeTitle: call.request.episodeTitle,
    episodeIndex: call.request.episodeIndex,
    backgroundUrl: call.request.backgroundUrl,
    logoUrl: call.request.logoUrl,
  };

  try {
    // Build the thumbnail
    await using img = await gen.buildWithPreset("thumb-rpg", args, {
      size: { width: 1280, height: 720 },
      fontDir: fontPath,
    });
    // Upload it on the remote storage
    await store.create(img.path);

    // And answer with the storage key
    const res = new ThumbnailResponse();
    res.thumbnailKey = basename(img.path);
    callback(null, res);
  } catch (e) {
    logger.error(` ${e.constructor.name}: ${e.toString()}`);
    callback(e, null);
  }
}

class Impl extends UnimplementedThumbnailService {
  CreateThumbnail(
    call: ServerUnaryCall<ThumbnailRequest, ThumbnailResponse>,
    callback: sendUnaryData<ThumbnailResponse>,
  ): void {
    createThumbnail(call, callback);
  }
}

server.addService(UnimplementedThumbnailService.definition, new Impl());

server.bindAsync(`0.0.0.0:${PORT}`, ServerCredentials.createInsecure(), () => {
  logger.info("Thumbnail server started on port " + PORT + " 🚀");
  server.start();
});
