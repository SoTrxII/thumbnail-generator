import "reflect-metadata";
import { ThumbRpg } from "./thumb-rpg.js";
import { fontPath, FontResource } from "../../../utils/resources.js";
import { FontCalculator } from "../../font-calculator/font-calculator.js";
import { ImageManipulatorBuilder } from "../../image-manipulator/image-manipulator-builder.js";
import { plainTextLogger } from "../../logger/logger-plain-text.js";
import { ImageDownloader } from "../../image-downloader/image-downloader.js";

const DEFAULT_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg";
describe("Thumb RPG integration testing", () => {
  let thumbRPG: ThumbRpg;

  beforeAll(() => {
    // Only to retrieve the preset name
    thumbRPG = new ThumbRpg(
      new FontCalculator(),
      new ImageManipulatorBuilder(plainTextLogger),
      new ImageDownloader(),
      plainTextLogger,
    );
  });

  // Disabled because ts-jest doesn't properly handle async disposable (11/2023)
  it.skip("Must create a correct thumbnail", async () => {
    const data = {
      gmsAvatarUrl: [DEFAULT_IMG],
      playersAvatarUrls: [DEFAULT_IMG, DEFAULT_IMG],
      title: "Squawk Squawk Squawk Squawk",
      episodeTitle:
        "Squak squak squak squak squak squak squak squak squak squak squak squak squak squak squak squak squak squak v",
      episodeIndex: 1,
      backgroundUrl: DEFAULT_IMG,
      logoUrl: DEFAULT_IMG,
    };
    await thumbRPG.build(data, {
      size: { width: 1920, height: 1080 },
      fontDir: fontPath,
      defaultFont: FontResource.LIBERATION_MONO,
      forceOptimize: false,
    });
  }, 20000);
});
