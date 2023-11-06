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
import { resolve } from "path";
import { IObjectStore } from "./internal/object-store/objet-store-api.js";
import {thumbnail} from "./proto/thumbnail.js";
import ThumbnailRequest = thumbnail.ThumbnailRequest;
import ThumbnailResponse = thumbnail.ThumbnailResponse;
import UnimplementedThumbnailService = thumbnail.UnimplementedThumbnailService;

const server = new Server();
const PORT = 50051;
const store = container.get<IObjectStore>(TYPES.ObjectStore);

async function createThumbnail(
  call: ServerUnaryCall<ThumbnailRequest, ThumbnailResponse>,
  callback: sendUnaryData<ThumbnailResponse>,
) {
  const gen = container.get<IThumbnailGenerator>(TYPES.ThumbnailGenerator);
  console.log("createThumbnail", call.request.toObject());
  const args = {
    gmsAvatarUrl: call.request.gmsAvatarUrl,
    title: call.request.title,
    episodeTitle: call.request.episodeTitle,
    episodeIndex: call.request.episodeIndex,
    backgroundUrl: call.request.backgroundUrl,
    logoUrl: call.request.logoUrl,
  };
  try {
    const imgPath = await gen.buildWithPreset("thumb-rpg", args, {
      size: { width: 1280, height: 720 },
      fontDir: resolve("./assets/fonts/"),
    });
    console.log("Final image path : ", imgPath);
    await store.create(imgPath);
  } catch (e) {
    console.log(` ${e.constructor.name}: ${e.toString()}`);
    callback(e, null);
  }
  callback(null, new ThumbnailResponse());
}
class Impl extends UnimplementedThumbnailService {
  CreateThumbnail(call: ServerUnaryCall<thumbnail.ThumbnailRequest, thumbnail.ThumbnailResponse>, callback: sendUnaryData<thumbnail.ThumbnailResponse>): void {
    createThumbnail(call, callback);
  }
}

server.addService(UnimplementedThumbnailService.definition, new Impl());

server.bindAsync(`0.0.0.0:${PORT}`, ServerCredentials.createInsecure(), () => {
  console.log("Thumbnail server started on port " + PORT + " 🚀");
  server.start();
});
