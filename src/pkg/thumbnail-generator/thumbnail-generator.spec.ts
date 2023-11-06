import "reflect-metadata";
import { InvalidPresetError, ThumbnailGenerator } from "./thumbnail-generator";
import { Substitute } from "@fluffy-spoon/substitute";
import { ThumbnailPreset } from "../../internal/presets/thumbnail-preset-api";
import { resolve } from "path";
import { tmpdir } from "os";
import { unlink } from "fs/promises";

describe("Thumbnail-generator", () => {
  const mockPreset = Substitute.for<ThumbnailPreset>();
  mockPreset.name.returns!("mock");
  const thg = new ThumbnailGenerator([mockPreset]);
  it("Should error gracefully on an unregistered template", async () => {
    await expect(
      async () =>
        await thg.buildWithPreset(mockPreset.name + "xx", undefined, undefined)
    ).rejects.toThrowError(InvalidPresetError);
  });

  it("Should run ok on a registered template", async () => {
    await thg.buildWithPreset(mockPreset.name, undefined, {
      forceOptimize: false,
    });
  });

  describe("Should optimize an image", () => {
    const outImage = `${tmpdir()}/opti_${Date.now()}`;
    it("jpg", async () => {
      const baseImage = resolve(
        __dirname,
        "../../../assets/images/background-blue-nature.jpg"
      );
      await thg.optimizeImage(baseImage, outImage);
    });

    it("png", async () => {
      const baseImage = resolve(
        __dirname,
        "../../../assets/images/sample-rpg-thumbnail.png"
      );
      await thg.optimizeImage(baseImage, outImage);
    });
    afterAll(async () => {
      await unlink(outImage);
    });
  });
});
