import { inject, injectable } from "inversify";
import { ThumbnailPreset } from "../thumbnail-preset-api";
import { validate } from "jsonschema";
import * as schema from "./schema.json";
import {
  GenerationOptions,
  ThumbnailSchemaError,
} from "../../../pkg/thumbnail-generator/thumbnail-generator";
import { tmpdir } from "os";
import { TYPES } from "../../../types";
import { IFontCalculator } from "../../font-calculator/font-calculator-api";
import { IImageManipulatorBuilder } from "../../image-manipulator/image-manipulator-builder-api";
import { IImageDownloader } from "../../image-downloader/image-downloader-api";
import { join } from "path";
import { Alignment } from "../../image-manipulator/image-manipulator-builder";
import Vibrant = require("node-vibrant");

interface ThumbRpgArgs {
  // Players avatars
  playersAvatarUrls: string[];
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
  /** Max sizes of a centered title/subtitle **/
  private static readonly BOUNDARIES = {
    title: { width: 850, height: 300 },
    subtitle: { width: 300, height: 200 },
  };

  constructor(
    @inject(TYPES.FontCalculator) protected fontCalculator: IFontCalculator,
    @inject(TYPES.ImageManipulatorBuilder)
    protected manipulator: IImageManipulatorBuilder,
    @inject(TYPES.ImageDownloader) protected downloader: IImageDownloader
  ) {
    super();
  }

  get name(): string {
    return "thumb-rpg";
  }

  async build(
    args: Record<string, any>,
    options?: Partial<GenerationOptions>
  ): Promise<string> {
    // This is a test backdoor
    if (options !== undefined) this.options = options as GenerationOptions;
    const fusedArgs = Object.assign(ThumbRpg.DEFAULT_ARGS, args);
    // Will throw on any validation error
    this.validateArgs(fusedArgs);
    this.initializeFont(
      join(this.options.fontDir, this.options.defaultFontPath)
    );
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

  async buildThumbnail(args: ThumbRpgArgs): Promise<string> {
    const subtitleFontSize = this.fontCalculator.getIdealFontSizeForScreen(
      args.episodeTitle,
      ThumbRpg.BOUNDARIES.subtitle
    );

    /*const titleFontSize = this.fontCalculator.getIdealFontSizeForScreen(
            args.title,
            ThumbRpg.BOUNDARIES.title
        );*/
    // Download the background image from its url and get the dominant colors for the borders
    const [colorPalette, tempBgImage] = await Promise.all([
      Vibrant.from(args.backgroundUrl).getPalette(),
      this.downloader.download(args.backgroundUrl),
    ]);

    // Also download gms images and logo
    const gmsImages = await Promise.all(
      args.gmsAvatarUrl.map(async (a) => await this.downloader.download(a))
    );

    const logoPath = await this.downloader.download(args.logoUrl);

    this.setBackground(tempBgImage, colorPalette.LightVibrant.getHex())
      .setTitle(args.title, 20, "#ffffff")
      .setEpisodeNumber(args.episodeIndex, 40, "#ffffff")
      .setSubTitle(args.episodeTitle, subtitleFontSize, "#ffffff")
      .setGmsAvatar(gmsImages)
      .setLogo(logoPath);

    const image = `${tmpdir()}/image-${Date.now()}.png`;
    await this.manipulator.buildAndRun(image);
    return image;
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
      this.options.fontDir
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
      this.options.fontDir
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
      this.options.fontDir
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
        String(this.options.size.width),
        String(this.options.size.height)
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
        borderColor
      )
      //Scaling with added border
      .withScaling(
        String(this.options.size.width),
        String(this.options.size.height)
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
        true
      );
    });
    return this;
  }

  /**
   * Set a logo to the bottom left corner
   * @param path
   * @private
   */
  setLogo(path: string) {
    this.manipulator.withImageAt(
      path,
      {
        x: String(20),
        y: "720-overlay_h - 20",
      },
      {
        width: String(120),
        height: String(120),
      }
    );
  }
}
