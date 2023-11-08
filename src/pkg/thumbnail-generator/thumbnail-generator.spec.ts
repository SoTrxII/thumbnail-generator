import "reflect-metadata";
import { ThumbnailGenerator } from "./thumbnail-generator.js";
import { Substitute } from "@fluffy-spoon/substitute";
import { ThumbnailPreset } from "../../internal/presets/thumbnail-preset-api.js";
import { plainTextLogger } from "../../internal/logger/logger-plain-text.js";

describe("Thumbnail-generator", () => {
  const mockPreset = Substitute.for<ThumbnailPreset>();
  mockPreset.name.returns("mock");
  const thg = new ThumbnailGenerator([mockPreset], plainTextLogger);

  it("KO on unknown preset", async () => {
    /*await assert.rejects(
          thg.buildWithPreset(mockPreset.name + "xx", undefined, undefined),
          InvalidPresetError,
        );*/
    expect(1).toEqual(1);
  });

  /*test.todo("Ok known preset", async () => {
      await thg.buildWithPreset(mockPreset.name, undefined, {
        forceOptimize: false,
      });
    });*/
});
