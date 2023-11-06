import "reflect-metadata";
import { ThumbnailService } from "./proto/thumbnail_grpc_pb.js";
import {
  sendUnaryData,
  Server,
  ServerCredentials,
  ServerUnaryCall,
} from "@grpc/grpc-js";
import { ThumbnailResponse, ThumbnailRequest } from "./proto/thumbnail_pb.js";
import { container } from "./inversify.config";
import { TYPES } from "./types";
import { IThumbnailGenerator } from "./pkg/thumbnail-generator/thumbnail-generator-api";
import { resolve } from "path";
import { IObjectStore } from "./internal/object-store/objet-store-api";

const server = new Server();
const PORT = 50051;
const gen = container.get<IThumbnailGenerator>(TYPES.ThumbnailGenerator);
const store = container.get<IObjectStore>(TYPES.ObjectStore);
async function createThumbnail(
  call: ServerUnaryCall<ThumbnailRequest, ThumbnailResponse>,
  callback: sendUnaryData<ThumbnailResponse>,
) {
  console.log("createThumbnail", call.request.toObject());
  const args = {
    gmsAvatarUrl: call.request.getGmsavatarurlList(),
    title: call.request.getTitle(),
    episodeTitle: call.request.getEpisodetitle(),
    episodeIndex: call.request.getEpisodeindex(),
    backgroundUrl: call.request.getBackgroundurl(),
    logoUrl: call.request.getLogourl(),
  };
  // TODO validate args
  try {
    const imgPath = await gen.buildWithPreset("thumb-rpg", args, {
      size: { width: 1280, height: 720 },
      fontDir: resolve(__dirname, "assets/fonts/"),
    });
    console.log("imgPath", imgPath);
    await store.create(imgPath);
  } catch (e) {
    console.log(` ${e.constructor.name}: ${e.toString()}`);
    callback(e, null);
  }
  callback(null, new ThumbnailResponse());
}

server.addService(ThumbnailService, {
  createThumbnail,
});

server.bindAsync(`0.0.0.0:${PORT}`, ServerCredentials.createInsecure(), () => {
  console.log("Thumbnail server started on port " + PORT + " 🚀");
  server.start();
});
