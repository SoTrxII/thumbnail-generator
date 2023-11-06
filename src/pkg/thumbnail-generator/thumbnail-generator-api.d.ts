import { GenerationOptions } from "./thumbnail-generator.js";

export interface IThumbnailGenerator {
  buildWithPreset(
    presetName: string,
    args: Record<string, any>,
    options: Partial<GenerationOptions>,
  ): Promise<string>;

  optimizeImage(inPath: string, outPath: string): Promise<void>;
}
