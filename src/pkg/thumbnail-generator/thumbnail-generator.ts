import { injectable, multiInject } from "inversify";
import { TYPES } from "../../types.js";
import { ThumbnailPreset } from "../../internal/presets/thumbnail-preset-api.js";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import { stat, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { hrtime } from "process";
import {
  GenerationOptions,
  InvalidPresetError,
  IThumbnailGenerator,
  OptimizationError,
} from "./thumbnail-generator-api.js";
import { fontPath, FontResource, getFont } from "../../utils/resources.js";
import { SmartFilePtr } from "../../utils/smart-file-ptr.js";

@injectable()
export class ThumbnailGenerator implements IThumbnailGenerator {
  private static readonly DEFAULT_OPTIONS: GenerationOptions = {
    // Path to font files
    fontDir: fontPath,
    defaultFont: FontResource.LIBERATION_MONO,
    size: { width: 1280, height: 720 },
    forceOptimize: false,
  };

  private static readonly THUMB_MAX_SIZE = 2 * 1024 * 1024;

  constructor(
    @multiInject(TYPES.ThumbnailPreset) private presets: ThumbnailPreset[],
  ) {}

  /**
   * Build the thumbnail with the given preset and arguments.
   * @throws InvalidPresetError if the presetName doesn't match any registered preset
   * @param presetName
   * @param args
   * @param options
   */
  async buildWithPreset(
    presetName: string,
    args: Record<string, any>,
    options: Partial<GenerationOptions>,
  ): Promise<SmartFilePtr> {
    const opt = Object.assign(ThumbnailGenerator.DEFAULT_OPTIONS, options);

    // Find a preset with the given name
    const preset = this.presets.find((p) => p.name === presetName);
    if (preset === undefined)
      throw new InvalidPresetError(`preset ${presetName} doesn't exists !`);
    let img = await preset.run(args, opt);

    // If the resulting image is too big for a YouTube thumbnail (>2MB), optimize it
    const fileStat = await stat(img.path);
    if (
      options.forceOptimize ||
      fileStat.size >= ThumbnailGenerator.THUMB_MAX_SIZE
    ) {
      console.log("Optimizing image " + img.path);
      let opti = await this.optimize(img);
      await img[Symbol.asyncDispose]();
      img = opti;
    }
    return img;
  }

  /**
   * Optimize the provided image, reducing its size
   * @param input
   */
  async optimize(input: SmartFilePtr): Promise<SmartFilePtr> {
    const files = await imagemin([input.path], {
      // Imagemin uses globby, which expect unix format. Setting glob to true will break on Windows
      // see https://github.com/imagemin/imagemin/issues/352
      glob: false,
      plugins: [
        // @ts-ignore
        imageminPngquant({
          quality: [0.5, 0.6],
        }),
      ],
    });
    const file = files?.[0];
    if (!file)
      throw new OptimizationError("Unexpected error during optimization");

    const optiPath = `${tmpdir()}/result_image_${hrtime().join("_")}`;
    await writeFile(optiPath, file.data);
    return new SmartFilePtr(optiPath);
  }
}
