import { GenerationOptions } from "./thumbnail-generator";

export interface IThumbnailGenerator {
  buildWithPreset(
    presetName: string,
    args: Record<string, any>,
    options: Partial<GenerationOptions>
  ): Promise<string>;

  optimizeImage(inPath: string, outPath: string): Promise<void>;
}
