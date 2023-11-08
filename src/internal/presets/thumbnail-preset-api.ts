import { injectable } from "inversify";
import { GenerationOptions } from "../../pkg/thumbnail-generator/thumbnail-generator-api.js";
import { SmartFilePtr } from "../../utils/smart-file-ptr.js";

@injectable()
export abstract class ThumbnailPreset {
  protected options: GenerationOptions;

  // Preset name
  public abstract get name(): string;

  /**
   * Build the thumbnail
   * @param args Arguments for the preset (i.e title value..)
   * @param options Generation options (i.e thumbnail size)
   */
  public async run(
    args: Record<string, any>,
    options: GenerationOptions,
  ): Promise<SmartFilePtr> {
    this.options = options;
    return this.build(args);
  }

  /**
   * Scale a text size from a given size to another
   * @param size text size
   * @param from initial thumbnail size
   * @param to destination thumbnail size
   * @return scaled size
   * @private
   */
  scaleSize(
    size: number,
    from: { width: number; height: number },
    to: { width: number; height: number },
  ): number {
    //pythagorean theorem
    const diagFrom = Math.sqrt(from.width ** 2 + from.height ** 2);
    const diagTo = Math.sqrt(to.width ** 2 + to.height ** 2);
    return size * (diagTo / diagFrom);
  }

  /**
   * Scale a bounding box from a given size to another
   * @param bounds bounding box
   * @param from initial thumbnail size
   * @param to destination thumbnail size
   * @return scaled bounding box
   * @private
   */
  scaleBoundaries(
    bounds: { width: number; height: number },
    from: { width: number; height: number },
    to: { width: number; height: number },
  ): { width: number; height: number } {
    const widthScaling = to.width / from.width;
    const heightScaling = to.height / from.height;

    return {
      width: bounds.width * widthScaling,
      height: bounds.height * heightScaling,
    };
  }

  protected abstract build(
    args: Record<string, any>,
    options?: GenerationOptions,
  ): Promise<SmartFilePtr>;
}
