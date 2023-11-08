import { ValidationError } from "jsonschema";
import { SmartFilePtr } from "../../utils/smart-file-ptr.js";

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
  defaultFont: string;
  /** Thumbnail size. Default 720p*/
  size: { width: number; height: number };
  /** Whether to optimize the resulting image, which can be quite big at first*/
  forceOptimize: boolean;
}

export interface IThumbnailGenerator {
  buildWithPreset(
    presetName: string,
    args: Record<string, any>,
    options: Partial<GenerationOptions>,
  ): Promise<SmartFilePtr>;

  optimize(input: SmartFilePtr): Promise<SmartFilePtr>;
}
