import { Container } from "inversify";
import { TYPES } from "./types";
import { FontCalculator } from "./internal/font-calculator/font-calculator";
import { IFontCalculator } from "./internal/font-calculator/font-calculator-api";
import { IImageManipulatorBuilder } from "./internal/image-manipulator/image-manipulator-builder-api";
import { ImageManipulatorBuilder } from "./internal/image-manipulator/image-manipulator-builder";
import { IImageDownloader } from "./internal/image-downloader/image-downloader-api";
import { ImageDownloader } from "./internal/image-downloader/image-downloader";
import { ThumbnailPreset } from "./internal/presets/thumbnail-preset-api";
import { ThumbRpg } from "./internal/presets/thumb-rpg/thumb-rpg";
import { ThumbnailGenerator } from "./pkg/thumbnail-generator/thumbnail-generator";
import { IThumbnailGenerator } from "./pkg/thumbnail-generator/thumbnail-generator-api";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";
import { DaprObjectStorageAdapter } from "./internal/object-store/dapr-object-storage-adapter";
import {IObjectStore, IObjectStoreProxy} from "./internal/object-store/objet-store-api";
import {ExternalObjectStore} from "./internal/object-store/external-objet-store";

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
  .toDynamicValue(() => new ImageManipulatorBuilder());

container
  .bind<IImageDownloader>(TYPES.ImageDownloader)
  .toDynamicValue(() => new ImageDownloader());

container
  .bind<IObjectStoreProxy>(TYPES.ObjectStoreProxy)
  .toConstantValue(new DaprObjectStorageAdapter(client.binding, objStoreName));

container.bind<IObjectStore>(TYPES.ObjectStore).to(ExternalObjectStore);

container
  .bind<ThumbnailPreset>(TYPES.ThumbnailPreset)
  .toDynamicValue(
    (context) =>
      new ThumbRpg(
        context.container.get(TYPES.FontCalculator),
        context.container.get(TYPES.ImageManipulatorBuilder),
        context.container.get(TYPES.ImageDownloader),
      ),
  );

container
  .bind<IThumbnailGenerator>(TYPES.ThumbnailGenerator)
  .toDynamicValue(
    (context) =>
      new ThumbnailGenerator(context.container.getAll(TYPES.ThumbnailPreset)),
  );
