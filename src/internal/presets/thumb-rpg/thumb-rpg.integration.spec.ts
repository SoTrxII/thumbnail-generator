import "reflect-metadata";
import { container } from "../../../inversify.config";
import { TYPES } from "../../../types";
import { ThumbnailPreset } from "../thumbnail-preset-api";
import { ThumbRpg } from "./thumb-rpg";
import { resolve } from "path";

const DEFAULT_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/9/9a/Gull_portrait_ca_usa.jpg";
describe("Thumb RPG integration testing", () => {
  let thumbRPG: ThumbRpg;
  beforeAll(() => {
    // Only to retrieve the preset name
    const mockTh = new ThumbRpg(undefined, undefined, undefined);
    // Resolve the value in the container with all its dependencies
    thumbRPG = container
      .getAll<ThumbnailPreset>(TYPES.ThumbnailPreset)
      .find((preset) => preset.name == mockTh.name) as ThumbRpg;
  });
  it("Must create a correct thumbnail", async () => {
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
      fontDir: resolve(__dirname, "../../../../assets/fonts/"),
      defaultFontPath: "liberation-mono/LiberationMono-Regular.ttf",
      forceOptimize: false,
    });
  }, 20000);
});
