import { Container } from "inversify";
import { TYPES } from "./types.js";
import { FontCalculator } from "./internal/font-calculator/font-calculator.js";
import { IFontCalculator } from "./internal/font-calculator/font-calculator-api.js";
import { IImageManipulatorBuilder } from "./internal/image-manipulator/image-manipulator-builder-api.js";
import { ImageManipulatorBuilder } from "./internal/image-manipulator/image-manipulator-builder.js";
import { IImageDownloader } from "./internal/image-downloader/image-downloader-api.js";
import { ImageDownloader } from "./internal/image-downloader/image-downloader.js";
import { ThumbnailPreset } from "./internal/presets/thumbnail-preset-api.js";
import { ThumbRpg } from "./internal/presets/thumb-rpg/thumb-rpg.js";
import { ThumbnailGenerator } from "./pkg/thumbnail-generator/thumbnail-generator.js";
import { IThumbnailGenerator } from "./pkg/thumbnail-generator/thumbnail-generator-api.js";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";
import { DaprObjectStorageAdapter } from "./internal/object-store/dapr-object-storage-adapter.js";
import {
  IObjectStore,
  IObjectStoreProxy,
} from "./internal/object-store/objet-store-api.js";
import { ExternalObjectStore } from "./internal/object-store/external-objet-store.js";
import { ILogger } from "./internal/logger/logger-api.js";
import { plainTextLogger } from "./internal/logger/logger-plain-text.js";
import { ecsLogger } from "./internal/logger/logger-ecs.js";

export const container = new Container();
const DAPR_GRPC_PORT = process.env.DAPR_GRPC_PORT ?? "50002";

const client = new DaprClient({
  daprHost: "127.0.0.1",
  daprPort: DAPR_GRPC_PORT,
  communicationProtocol: CommunicationProtocolEnum.GRPC,
});
const objStoreName = process.env.OBJECT_STORE_NAME ?? "object-store";

container.bind<IFontCalculator>(TYPES.FontCalculator).to(FontCalculator);

container
  .bind<IImageManipulatorBuilder>(TYPES.ImageManipulatorBuilder)
  .to(ImageManipulatorBuilder);

container.bind<IImageDownloader>(TYPES.ImageDownloader).to(ImageDownloader);

container
  .bind<IObjectStoreProxy>(TYPES.ObjectStoreProxy)
  .toConstantValue(new DaprObjectStorageAdapter(client.binding, objStoreName));

container.bind<IObjectStore>(TYPES.ObjectStore).to(ExternalObjectStore);

container.bind<ThumbnailPreset>(TYPES.ThumbnailPreset).to(ThumbRpg);

container
  .bind<IThumbnailGenerator>(TYPES.ThumbnailGenerator)
  .to(ThumbnailGenerator);
