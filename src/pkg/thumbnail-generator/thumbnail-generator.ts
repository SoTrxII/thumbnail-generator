import { injectable, multiInject } from "inversify";
import { TYPES } from "../../types";
import { ThumbnailPreset } from "../../internal/presets/thumbnail-preset-api";
import { ValidationError } from "jsonschema";
import * as imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import { unlink, writeFile } from "fs/promises";
import { resolve } from "path";
import { tmpdir } from "os";
import { hrtime } from "process";
import { IThumbnailGenerator } from "./thumbnail-generator-api";

export class ThumbnailSchemaError extends Error {
  constructor(private errors: ValidationError[]) {
    super();
  }

  toString(): string {
    return this.errors.map((e) => `${e.argument} : ${e.message}`).join("\n");
  }
}

export class InvalidPresetError extends Error {}

export class OptimizationError extends Error {}

/**
 * All generic user configurable options for the thumbnail generation
 */
export interface GenerationOptions {
  /** Where to find fonts. Don't change it unless you know what you are doing */
  fontDir: string;
  /** Path to the default font to use. This must be relative to fontDir*/
  defaultFontPath: string;
  /** Thumbnail size. Default 720p*/
  size: { width: number; height: number };
  /** Whether to optimize the resulting image, which can be quite big at first*/
  optimizeImage: boolean;
}

@injectable()
export class ThumbnailGenerator implements IThumbnailGenerator {
  private static readonly DEFAULT_OPTIONS: GenerationOptions = {
    // Path to font files
    fontDir: resolve(__dirname, "../../../assets/fonts"),
    defaultFontPath: "liberation-mono/LiberationMono-Regular.ttf",
    size: { width: 1280, height: 720 },
    optimizeImage: true,
  };

  constructor(
    @multiInject(TYPES.ThumbnailPreset) private presets: ThumbnailPreset[]
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
    options: Partial<GenerationOptions>
  ): Promise<string> {
    const opt = Object.assign(ThumbnailGenerator.DEFAULT_OPTIONS, options);
    const preset = this.presets.find((p) => p.name === presetName);
    if (preset === undefined)
      throw new InvalidPresetError(`preset ${presetName} doesn't exists !`);
    let imagePath = await preset.run(args, opt);

    if (options.optimizeImage) {
      const optiPath = `${tmpdir()}/result_image_${hrtime().join("_")}`;
      await this.optimizeImage(imagePath, optiPath);
      await unlink(imagePath);
      imagePath = optiPath;
    }
    return imagePath;
  }

  /**
   * Optimize the provided image, reducing its size
   * @param inPath
   * @param outPath
   */
  async optimizeImage(inPath: string, outPath: string): Promise<void> {
    const files = await imagemin([inPath], {
      // Imagemin uses globby, which expect unix format. Setting glob to true will break on Windows
      // see https://github.com/imagemin/imagemin/issues/352
      glob: false,
      plugins: [
        imageminPngquant({
          quality: [0.5, 0.6],
        }),
      ],
    });
    const file = files?.[0];
    if (!file)
      throw new OptimizationError("Unexpected error during optimization");
    await writeFile(outPath, file.data);
  }
}
