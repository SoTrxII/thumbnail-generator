import { injectable } from "inversify";
import { GenerationOptions } from "../../pkg/thumbnail-generator/thumbnail-generator";

@injectable()
export abstract class ThumbnailPreset {
  protected options: GenerationOptions;

  protected constructor() {}

  // Preset name
  public abstract get name(): string;

  /**
   * Build the thumbnail
   * @param args Arguments for the preset (i.e title value..)
   * @param options Generation options (i.e thumbnail size)
   */
  public async run(
    args: Record<string, any>,
    options: GenerationOptions
  ): Promise<string> {
    this.options = options;
    return this.build(args);
  }

  protected abstract build(
    args: Record<string, any>,
    options?: GenerationOptions
  ): Promise<string>;
}
