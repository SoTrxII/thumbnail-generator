import { injectable } from "inversify";
import ffmpeg from "fluent-ffmpeg";
import { FfmpegCommand, FilterSpecification } from "fluent-ffmpeg";
import { tmpdir } from "os";
import sharp from "sharp";
import { unlinkSync, writeFileSync } from "fs";
import { hrtime } from "process";
import {
  IImageManipulatorBuilder,
  TextStyle,
} from "./image-manipulator-builder-api";

export enum Alignment {
  NONE,
  BOTTOM_LEFT,
  BOTTOM_CENTER,
  BOTTOM_RIGHT,
  TOP_LEFT = 5,
  TOP_CENTER,
  TOP_RIGHT,
  MIDDLE_LEFT = 9,
  MIDDLE_CENTER,
  MIDDLE_RIGHT,
}

@injectable()
export class ImageManipulatorBuilder implements IImageManipulatorBuilder {
  /** Background to use in the thumbnail. Will default to a black screen if not specified */
  private background: string;

  /** FFMPEG sub-process **/
  private ffmpegCommand: FfmpegCommand;

  /** Files to delete after the thumbnail has been generated.
   * The building process will generate a lot of temp files, as FFMPEG mainly works with file inputs
   */
  private filesToCleanup: string[] = [];

  /** List of ffmpeg filters to add in a -filter_complex
   * @see https://ffmpeg.org/ffmpeg-filters.html
   */
  private filters: FilterSpecification[] = [];

  /** Ffmpeg inputs loaded with -i. These are all files*/
  private inputs: string[] = [];

  /** List of callbacks to be executed before the FFMPEG process is started
   * Ex: the subtitle filter needs a subtitle file to be created. Creating it
   * directly when the builder function is called would lead to this file not being
   * deleted if the command is aborted. This is why all of these are executed just before
   * the FFMpeg process starts, in the buildAndRun() function
   * */
  private pipeline: Function[] = [];

  /** Last ffmpeg input in the filterGraph. This is a loockback to the previous lastOutput
   * Given a filtergraph of [0:v]filter[res], lastInput will be [O:v]
   */
  private lastInput: string;

  /** Last ffmpeg output in the filterGraph.
   * As the background is always the first file input, the first ouput is always [O:v]
   * Given a filtergraph of [0:v]filter[res], lastOutput is "res"
   */
  private lastOutput = "0:v";

  constructor() {
    this.ffmpegCommand = ffmpeg();
    this.shiftFiltergraph();
  }

  /**
   * Convert a color from the standard #rrggbb to &Hbbggrr of ass format
   * Transparency will be ignored
   */
  private static colorHexToAssHex(hex: string) {
    const rawInput = hex.replace("#", "").trim();
    const rr = rawInput.substring(0, 2);
    const gg = rawInput.substring(2, 4);
    const bb = rawInput.substring(4, 6);
    return `&H${bb}${gg}${rr}&`;
  }

  /**
   * FFMpeg filters works with unix style paths.
   * To support windows, we must escape slashes and colons
   *
   * Note : ffmpeg does in fact support Windows notation, but only in -i inputs.
   * Using a Windows style path in filters will interpret it as a Unix path and errors
   * @param path path to sanitize
   * @returns escaped path
   * @private
   */
  private static sanitizeWindowsPath(path: string): string {
    return (
      path
        // Replace backslashes with forward slashes
        .replace(/\\/g, "/")
        // Escape windows drive notation ( C: -> C\\:)
        .replace(/:/g, "\\\\:")
    );
  }

  /**
   * Write a subtitle file to be used to write text on the image.
   *
   * The file format in {index}\n{fromTime} --> {toTime}\n{textToWrite}
   * but as the thumbnail is an image, the time arguments are not important
   * @param text Text to write on the image
   * @param outFile Where to write the file
   * @private
   */
  private static createSubtitleFile(text: string, outFile: string) {
    writeFileSync(outFile, `1\n00:00:00,000 --> 00:00:01,000\n${text}`);
  }

  /**
   * Set the background of the thumbnail to the provided image
   * @param path
   */
  withBackgroundImage(path: string): this {
    this.background = path;
    return this;
  }

  /**
   * Write a text on the thumbnail with an alignment
   * @param text Text to write
   * @param alignment A position on the frame
   * @param margin x and y offset from the `alignment`
   * @param size text size, in pt
   * @param color Text color in Hex #rrggbb notation. Transparency is ignored
   * @param font Font name to write the text in. It must be installed on the system
   * @param fontsDir Where to find the font, better not change it
   */
  withTextAligned(
    text: string,
    alignment: Alignment,
    margin: { x: number; y: number },
    size: number,
    color: string,
    font?: string,
    fontsDir?: string
  ): this {
    let style: TextStyle = {
      Fontsize: size,
      Outline: 1,
      Alignment: alignment,
      MarginV: margin.y,
      MarginL: margin.x,
      Shadow: 1,
      PrimaryColour: ImageManipulatorBuilder.colorHexToAssHex(color),
    };
    if (font !== undefined) {
      style = Object.assign(style, { Fontname: font });
    }
    if (fontsDir) {
      return this.drawText(text, style, fontsDir);
    }
    return this.drawText(text, style);
  }

  /**
   * Write a text on the thumbnail with only coordinates
   * @deprecated Alignment 0 doesn't seem to work anymore on newer FFmpeg versions
   * @param text
   * @param coordinates
   * @param size
   * @param color
   * @param font
   * @param fontsDir
   */
  withTextAt(
    text: string,
    coordinates: { x: string; y: string },
    size: number,
    color: string,
    font?: string,
    fontsDir?: string
  ): this {
    let style: TextStyle = {
      Fontsize: size,
      Outline: 1,
      Alignment: Alignment.NONE,
      MarginV: coordinates.y,
      MarginL: coordinates.x,
      Shadow: 1,
      PrimaryColour: ImageManipulatorBuilder.colorHexToAssHex(color),
    };
    if (font !== undefined) {
      style = Object.assign(style, { Fontname: font });
    }
    if (fontsDir) {
      return this.drawText(text, style, fontsDir);
    }
    return this.drawText(text, style);
  }

  /**
   * Add a drop shadow to the image in the provided path
   * @param inFile input file path
   * @param outFile output file path
   */
  async addShadowToImage(inFile: string, outFile: string): Promise<void> {
    const stream = sharp(inFile);
    const { width, height } = await stream.metadata();
    const SHADOW_MARGIN = 40;
    const SHADOW_BLUR = 15;
    const SHADOW_OFFSET = 15;
    const SHADOW_OPACITY = 0.7;
    const OUTPUT_WIDTH = width + SHADOW_MARGIN * 2;
    const OUTPUT_HEIGHT = height + SHADOW_MARGIN * 2;

    const shadow = await sharp(
      Buffer.from(`
    <svg
      width="${width + SHADOW_MARGIN * 2}"
      height="${height + SHADOW_MARGIN * 2}"
    >
      <circle
        r="${(width + SHADOW_MARGIN) / 2}"
        cx="${(width + SHADOW_MARGIN * 2) / 2 + SHADOW_OFFSET}"
        cy="${(height + SHADOW_MARGIN * 2) / 2 + SHADOW_OFFSET}"
        fill="rgba(0, 0, 0, ${SHADOW_OPACITY})"
      />
    </svg>`)
    )
      .blur(SHADOW_BLUR)
      .toBuffer();

    const image = await stream
      .resize({
        height,
        width,
      })
      .toBuffer();

    await sharp({
      create: {
        width: OUTPUT_WIDTH,
        height: OUTPUT_HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: shadow, blend: "multiply" },
        { input: image, blend: "over" },
      ])
      .png()
      .toFile(outFile);
  }

  /**
   * Add an image on the thumbnail at specific coordinates
   * @param imagePath image to add on the thumbnail
   * @param coordinates x and y. Unexpected things can happen if x and y are over the image width
   * @param size Size of the image
   * @param rounded Apply a border-radius-like effect on the image to add before drawing it on the thumbnail
   * @param withShadow Apply a drop shadow effect on the image before drawing it on the thumbnail
   */
  withImageAt(
    imagePath: string,
    coordinates: { x: string; y: string },
    size: { width: string; height: string },
    rounded = false,
    withShadow = false
  ): this {
    const nextSteps = [imagePath];
    // Path of the next pipeline step
    if (rounded) {
      const roundingStep = `${tmpdir()}/tmp_${hrtime().join("_")}`;
      nextSteps.push(roundingStep);
      this.pipeline.push(
        this.roundImage
          .bind(this, nextSteps[nextSteps.length - 2])
          .bind(this, nextSteps[nextSteps.length - 1])
          .bind(this, withShadow)
      );
    }
    this.inputs.push(nextSteps[nextSteps.length - 1]);
    const logoInputOriginal = `${this.inputs.length}:v`;
    const logoInputResized = `${this.inputs.length}_resized:v`;
    this.filters.push({
      filter: "scale",
      options: {
        width: size.width,
        height: size.height,
      },
      inputs: logoInputOriginal,
      outputs: logoInputResized,
    });

    this.filters.push({
      filter: "overlay",
      options: {
        x: coordinates.x,
        y: coordinates.y,
      },
      inputs: [this.lastInput, logoInputResized],
      outputs: this.lastOutput,
    });
    this.shiftFiltergraph();
    return this;
  }

  /**
   * Resize the thumbnail
   * @param width
   * @param height
   */
  withScaling(width: string, height: string): this {
    this.filters.push({
      filter: "scale",
      options: {
        width: width,
        height: height,
        flags: "lanczos+full_chroma_inp",
      },
      inputs: this.lastInput,
      outputs: this.lastOutput,
    });
    this.shiftFiltergraph();
    return this;
  }

  /**
   * Add border to the image
   * @param coordinates where to generate borders
   * @param size border's thickness
   * @param color border's color
   */
  withBorders(
    coordinates: { x: string; y: string },
    size: { width: string; height: string },
    color: string
  ): this {
    this.filters.push({
      filter: "pad",
      options: {
        width: size.width,
        height: size.height,
        x: coordinates.x,
        y: coordinates.y,
        color: color,
      },
      inputs: this.lastInput,
      outputs: this.lastOutput,
    });
    this.shiftFiltergraph();
    return this;
  }

  /**
   * Generates the thumbnail.
   * @param outPath Thumbnail path
   */
  async buildAndRun(outPath?: string): Promise<void> {
    //Resolve background
    if (this.background === undefined) {
      this.ffmpegCommand
        .input("color=black:s=1280x720:r=1")
        .inputFormat("lavfi")
        .outputOption("-vframes 1");
    } else {
      this.ffmpegCommand.input(this.background);
      // Resize the image to default Yt thumbnail format if no other scaling was specified
      if (
        !this.filters?.some((f) => f.filter === "scale" && f.inputs === "0:v")
      )
        this.withScaling(String(1280), String(720));
    }

    // Add all other inputs
    this.inputs.forEach((i) => this.ffmpegCommand.input(i));

    if (this.filters?.length) {
      //Assuming the filter graph is always shifted, the input to map should be the last
      this.ffmpegCommand.complexFilter(this.filters).map(this.lastInput);
    }

    if (!outPath) outPath = `${tmpdir()}/image-${Date.now()}.png`;
    return await new Promise(async (res, rej) => {
      // Execute pipeline steps
      await Promise.all(this.pipeline.map(async (f) => await f()));
      this.ffmpegCommand
        .on("progress", (_) => {})
        .on("stderr", function (stderrLine) {
          //console.log("Stderr output: " + stderrLine + "\n");
        })
        .on("start", (cmdLine) => {
          console.log(cmdLine + "\n");
        })
        .on("error", (err) => {
          rej(err);
        })
        .on("end", () => {
          this.filesToCleanup.forEach((f) => unlinkSync(f));
          res();
        })
        .saveToFile(outPath);
    });
  }

  /**
   * Prepare the ffmpeg -complex-filter to add another filter
   *
   * The last filter output becomes the next input and a new output name is generated
   * @private
   */
  private shiftFiltergraph() {
    this.lastInput = this.lastOutput;
    const lastFilterName =
      this.filters[this.filters.length - 1]?.filter || "base";
    this.lastOutput = `${lastFilterName}${this.filters.length}`;
  }

  /**
   * Generic draw text and the image
   * @param text Draw to draw
   * @param style all options provided by the subtitles filter
   * @param fontsDir Fonts directory
   * @private
   */
  private drawText(text: string, style: TextStyle, fontsDir?: string): this {
    const subFile = `${tmpdir()}/sub_${hrtime().join("_")}`;
    this.pipeline.push(
      ImageManipulatorBuilder.createSubtitleFile
        .bind(this, text)
        .bind(this, subFile)
    );
    this.filesToCleanup.push(subFile);
    const styleString = Object.entries(style)
      .map(([key, value]) => `${key}=${value}`)
      .join(",");

    const options = {
      filename: ImageManipulatorBuilder.sanitizeWindowsPath(subFile),
      force_style: styleString,
    };
    if (fontsDir) {
      options["fontsdir"] =
        ImageManipulatorBuilder.sanitizeWindowsPath(fontsDir);
    }
    this.filters.push({
      filter: "subtitles",
      options: options,
      inputs: this.lastInput,
      outputs: this.lastOutput,
    });
    this.shiftFiltergraph();
    return this;
  }

  /**
   * Round the image with path `inFile` to another file `outPath`.
   * This is similar to CSS border radius
   * @param inFile input file path
   * @param outFile output file path
   * @param withShadow if true add a drop shadow. Default: false
   * // TODO : Remove size constraints
   * @private
   */
  private async roundImage(inFile, outFile, withShadow = false) {
    this.filesToCleanup.push(outFile);
    const width = 400,
      r = width / 2,
      height = 400,
      circleShape = Buffer.from(
        `<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`
      );

    await sharp(inFile)
      .resize(width, height)
      .composite([
        {
          input: circleShape,
          blend: "dest-in",
        },
      ])
      .png()
      .toFile(outFile);

    if (withShadow) await this.addShadowToImage(outFile, outFile);
  }
}
