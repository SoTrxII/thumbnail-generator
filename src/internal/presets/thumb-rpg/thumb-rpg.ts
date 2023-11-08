import { inject, injectable } from "inversify";
import { ThumbnailPreset } from "../thumbnail-preset-api.js";
import { validate } from "jsonschema";
import schema from "./schema.json" assert { type: "json" };
import { tmpdir } from "os";
import { TYPES } from "../../../types.js";
import { IFontCalculator } from "../../font-calculator/font-calculator-api.js";
import { IImageManipulatorBuilder } from "../../image-manipulator/image-manipulator-builder-api.js";
import { IImageDownloader } from "../../image-downloader/image-downloader-api.js";
import { join } from "path";
import { Alignment } from "../../image-manipulator/image-manipulator-builder.js";
import Vibrant from "node-vibrant";
import {
  GenerationOptions,
  ThumbnailSchemaError,
} from "../../../pkg/thumbnail-generator/thumbnail-generator-api.js";
import { SmartFilePtr } from "../../../utils/smart-file-ptr.js";
import {ILogger} from "../../logger/logger-api.js";

import("disposablestack/auto");

interface ThumbRpgArgs {
  // Game Master's Avatar
  gmsAvatarUrl: string[];
  // Title of the Tabletop RPg campaign
  title: string;
  // Title of this specific episode
  episodeTitle: string;
  // Index of the episode in the campaign
  episodeIndex: number;
  // Background image URL
  backgroundUrl: string;
  // Bot left corner logo
  logoUrl: string;
}

@injectable()
export class ThumbRpg extends ThumbnailPreset {
  /** Default value for campaigns args */
  private static readonly DEFAULT_ARGS = {
    /** Default image */
    backgroundUrl:
      "https://res.cloudinary.com/datfhmsze/image/upload/c_thumb,w_200,g_face/v1595876755/deafault_campaign_background_tgfowg.jpg",
  };
  private static readonly DEFAULT_OPTIONS = {
    size: { width: 1280, height: 720 },
  };
  /** Max sizes of a centered title/subtitle **/
  private static readonly BOUNDARIES = {
    title: { width: 850, height: 300 },
    subtitle: { width: 300, height: 250 },
    episodeIndex: { width: 220, height: 220 },
  };

  constructor(
    @inject(TYPES.FontCalculator) protected fontCalculator: IFontCalculator,
    @inject(TYPES.ImageManipulatorBuilder)
    protected manipulator: IImageManipulatorBuilder,
    @inject(TYPES.ImageDownloader) protected downloader: IImageDownloader,
    @inject(TYPES.Logger) protected logger: ILogger,
  ) {
    super();
  }

  get name(): string {
    return "thumb-rpg";
  }

  async build(
    args: Record<string, any>,
    options?: Partial<GenerationOptions>,
  ): Promise<SmartFilePtr> {
    // This is a test backdoor
    if (options !== undefined) this.options = options as GenerationOptions;
    const fusedArgs = Object.assign(ThumbRpg.DEFAULT_ARGS, args);
    // Will throw on any validation error
    this.validateArgs(fusedArgs);
    this.initializeFont(join(this.options.fontDir, this.options.defaultFont));
    // Validation is OK, casting is safe
    return this.buildThumbnail(fusedArgs as ThumbRpgArgs);
  }

  /**
   * Validate the provided arguments against the registered schema
   * @param args
   */
  validateArgs(args: Record<string, any>): void {
    // There is an error in jsonschema typing, we must ignore the JSON error to continue
    //@ts-ignore
    const validation = validate(args, schema);
    if (validation.errors.length > 0) {
      throw new ThumbnailSchemaError(validation.errors);
    }
  }

  /**
   * Initialize the font to use in the thumbnail
   * @param fontPath
   */
  initializeFont(fontPath: string): void {
    // Initialize font to use
    this.fontCalculator.font = fontPath;
    // TODO, accept more fonts ?
  }

  async buildThumbnail(args: ThumbRpgArgs): Promise<SmartFilePtr> {
    const subtitleFontSize = this.fontCalculator.getIdealFontSizeForScreen(
      args.episodeTitle,
      this.scaleBoundaries(
        ThumbRpg.BOUNDARIES.subtitle,
        ThumbRpg.DEFAULT_OPTIONS.size,
        this.options.size,
      ),
    );

    const titleSize = this.scaleSize(
      20,
      ThumbRpg.DEFAULT_OPTIONS.size,
      this.options.size,
    );
    const episodeIndexSize = this.scaleSize(
      40,
      ThumbRpg.DEFAULT_OPTIONS.size,
      this.options.size,
    );
    // Also download gms images and log
    // Download the background image from its url and get the dominant colors for the borders
    await using bg = await this.downloader.download(args.backgroundUrl);
    const colorPlatte = await Vibrant.from(bg.path).getPalette();

    await using stack = new AsyncDisposableStack();
    const aRes = await Promise.allSettled(
      args.gmsAvatarUrl.map((a) => this.downloader.download(a)),
    );

    aRes
      .filter((r) => r.status === "rejected")
      .forEach((r: PromiseRejectedResult) =>
        this.logger.warn(`Impossible to download : ${r.reason}`),
      );

    const gmsImages = aRes
      .filter((r) => r.status === "fulfilled")
      .map((r: PromiseFulfilledResult<SmartFilePtr>) => {
        stack.use(r.value);
        return r.value;
      });

    await using logo = await this.downloader.download(args.logoUrl);

    this.setBackground(bg.path, colorPlatte.LightVibrant.hex)
      .setTitle(args.title, titleSize, "#ffffff")
      .setEpisodeNumber(args.episodeIndex, episodeIndexSize, "#ffffff")
      .setSubTitle(args.episodeTitle, subtitleFontSize, "#ffffff")
      .setGmsAvatar(gmsImages.map((i) => i.path))
      .setLogo(logo.path)
      .setFinalSize({
        width: this.options.size.width,
        height: this.options.size.height,
      });

    const imagePath = `${tmpdir()}/image-${Date.now()}.png`;
    await this.manipulator.buildAndRun(imagePath);
    return new SmartFilePtr(imagePath);
  }

  /**
   * Set the title of the thumbnail in the center
   * @param title
   * @param size
   * @param color
   * @private
   */
  setTitle(title: string, size: number, color: string): this {
    this.manipulator.withTextAligned(
      title,
      Alignment.TOP_CENTER,
      { x: 0, y: 65 },
      size,
      color,
      this.fontCalculator.familyName,
      this.options.fontDir,
    );
    return this;
  }

  /**
   * Set the title of the thumbnail in bottom center
   * @param title
   * @param size
   * @param color
   * @private
   */
  setSubTitle(title: string, size: number, color: string): this {
    this.manipulator.withTextAligned(
      title,
      Alignment.BOTTOM_CENTER,
      { x: 0, y: 50 },
      size,
      color,
      this.fontCalculator.familyName,
      this.options.fontDir,
    );
    return this;
  }

  /**
   * Set the episode in the top right corner
   * @param episodeIndex
   * @param size
   * @param color
   * @private
   */
  setEpisodeNumber(episodeIndex: number, size: number, color: string): this {
    this.manipulator.withTextAligned(
      `#${episodeIndex}`,
      Alignment.TOP_RIGHT,
      { x: 0, y: 0 },
      size,
      color,
      this.fontCalculator.familyName,
      this.options.fontDir,
    );
    return this;
  }

  /**
   * Set the background image for the whole thumbnail, with borders
   * @param backgroundPath
   * @param borderColor
   */
  setBackground(backgroundPath: string, borderColor: string): this {
    this.manipulator
      .withBackgroundImage(backgroundPath)
      //Scaling the image first
      .withScaling(
        String(ThumbRpg.DEFAULT_OPTIONS.size.width),
        String(ThumbRpg.DEFAULT_OPTIONS.size.height),
      )
      .withBorders(
        {
          x: "5",
          y: "5",
        },
        {
          height: "10+ih",
          width: "10+iw",
        },
        borderColor,
      )
      //Scaling with added border
      .withScaling(
        String(ThumbRpg.DEFAULT_OPTIONS.size.width),
        String(ThumbRpg.DEFAULT_OPTIONS.size.height),
      );

    return this;
  }

  /**
   * Set the rounded GM avatar to the top left corner of the image
   * @param imagePaths
   */
  setGmsAvatar(imagePaths: string[]): this {
    const width = 160;
    const height = 160;
    const offset = 20;
    imagePaths.forEach((imagePath, index) => {
      this.manipulator.withImageAt(
        imagePath,
        {
          x: String((index * (width + 1.5 * offset)) / 2 + offset),
          y: String(offset),
        },
        {
          width: String(width),
          height: String(height),
        },
        true,
        true,
      );
    });
    return this;
  }

  /**
   * Set a logo to the bottom left corner
   * @param path
   * @private
   */
  setLogo(path: string): this {
    this.manipulator.withImageAt(
      path,
      {
        x: String(20),
        y: "720-overlay_h - 20",
      },
      {
        width: String(120),
        height: String(120),
      },
    );
    return this;
  }

  /**
   * Scale the thumbnail to its final size
   * @param size
   */
  setFinalSize(size: { width: number; height: number }): this {
    this.manipulator.withScaling(String(size.width), String(size.height));
    return this;
  }
}
