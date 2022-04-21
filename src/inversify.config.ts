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

export const container = new Container();

container.bind<IFontCalculator>(TYPES.FontCalculator).to(FontCalculator);

container
  .bind<IImageManipulatorBuilder>(TYPES.ImageManipulatorBuilder)
  .to(ImageManipulatorBuilder);

container.bind<IImageDownloader>(TYPES.ImageDownloader).to(ImageDownloader);

container.bind<ThumbnailPreset>(TYPES.ThumbnailPreset).to(ThumbRpg);

container
  .bind<IThumbnailGenerator>(TYPES.ThumbnailGenerator)
  .to(ThumbnailGenerator);
