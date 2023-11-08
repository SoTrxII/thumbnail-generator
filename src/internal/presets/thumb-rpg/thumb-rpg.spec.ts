import "reflect-metadata";
import { ThumbRpg } from "./thumb-rpg.js";
import { Substitute } from "@fluffy-spoon/substitute";
import { IFontCalculator } from "../../font-calculator/font-calculator-api.js";
import { IImageManipulatorBuilder } from "../../image-manipulator/image-manipulator-builder-api.js";
import { IImageDownloader } from "../../image-downloader/image-downloader-api.js";
import { ThumbnailSchemaError } from "../../../pkg/thumbnail-generator/thumbnail-generator-api.js";
import { plainTextLogger } from "../../logger/logger-plain-text.js";

const DEFAULT_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg";
describe("Thumb RPG", () => {
  const thumbRPG = new ThumbRpg(
    Substitute.for<IFontCalculator>(),
    Substitute.for<IImageManipulatorBuilder>(),
    Substitute.for<IImageDownloader>(),
    plainTextLogger,
  );
  it("Must panic on wrong schema", () => {
    const data = {
      //title: "meh",
      episodeTitle: "mah",
      episodeIndex: "1",
      backgroundUrl: "jjj",
      logoUrl: "jjj",
    };
    expect(() => thumbRPG.validateArgs(data)).toThrowError(
      ThumbnailSchemaError,
    );
  });

  it("Must accept complete schema", () => {
    const data = {
      gmsAvatarUrl: [DEFAULT_IMG],
      playersAvatarUrls: [DEFAULT_IMG, DEFAULT_IMG],
      title: "meh",
      episodeTitle: "mah",
      episodeIndex: 1,
      backgroundUrl: DEFAULT_IMG,
      logoUrl: DEFAULT_IMG,
    };
    expect(() => thumbRPG.validateArgs(data)).not.toThrow();
  });
});
