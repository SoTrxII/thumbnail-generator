import { injectable } from "inversify";
import * as ffmpeg from "fluent-ffmpeg";
import { FfmpegCommand, FilterSpecification } from "fluent-ffmpeg";
import { tmpdir } from "os";
import * as sharp from "sharp";
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
  private background: string;
  private ffmpegCommand: FfmpegCommand;
  private filesToCleanup: string[] = [];
  private filters: FilterSpecification[] = [];
  private inputs: string[] = [];
  private pipeline: Function[] = [];
  private lastInput: string;
  private lastOutput = "0:v";

  constructor() {
    this.ffmpegCommand = ffmpeg();
    this.shiftFiltergraph();
  }

  /**
   * The provided path can be a Windows path
   * @param path
   * @private
   */
  private static sanitizePath(path: string): string {
    return (
      path
        // Replace backslashes with forward slashes
        .replace(/\\/g, "/")
        // Escape windows drive notation ( C: -> C\\:)
        .replace(/:/g, "\\\\:")
    );
  }

  private static createSubtitleFile(text: string, outFile: string) {
    writeFileSync(outFile, `1\n00:00:00,000 --> 00:00:01,000\n${text}`);
  }

  /**
   * Ass format uses a weird bbggrr order insted of rrggbb
   */
  private static colorHexToAssHex(hex: string) {
    const rawInput = hex.replace("#", "").trim();
    const rr = rawInput.substring(0, 2);
    const gg = rawInput.substring(2, 4);
    const bb = rawInput.substring(4, 6);
    return `&H${bb}${gg}${rr}&`;
  }

  private static generateTmpPath() {
    return `${tmpdir()}/image-${Date.now()}.png`;
  }

  withBackgroundImage(path: string): ImageManipulatorBuilder {
    this.background = path;
    return this;
  }

  withTextAligned(
    text: string,
    alignment: Alignment,
    margin: { x: number; y: number },
    size: number,
    color: string,
    font?: string,
    fontsDir?: string
  ): ImageManipulatorBuilder {
    const style: TextStyle = {
      Fontsize: size,
      Outline: 1,
      Alignment: alignment,
      MarginV: margin.y,
      MarginL: margin.x,
      Shadow: 1,
      PrimaryColour: ImageManipulatorBuilder.colorHexToAssHex(color),
      Fontname: font,
    };
    if (fontsDir) {
      return this.drawText(text, style, fontsDir);
    }
    return this.drawText(text, style);
  }

  withTextAt(
    text: string,
    coordinates: { x: string; y: string },
    size: number,
    color: string,
    font?: string,
    fontsDir?: string
  ): ImageManipulatorBuilder {
    const style: TextStyle = {
      Fontsize: size,
      Outline: 1,
      Alignment: Alignment.NONE,
      MarginV: coordinates.y,
      MarginL: coordinates.x,
      Shadow: 1,
      PrimaryColour: ImageManipulatorBuilder.colorHexToAssHex(color),
      Fontname: font,
    };
    if (fontsDir) {
      return this.drawText(text, style, fontsDir);
    }
    return this.drawText(text, style);
  }

  async addShadowToImage(inFile: string, outFile: string): Promise<void> {
    const stream = await sharp(inFile);
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

  withImageAt(
    imagePath: string,
    coordinates: { x: string; y: string },
    size: { width: string; height: string },
    rounded = false,
    withShadow = false
  ): ImageManipulatorBuilder {
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

  withScaling(width: string, height: string): ImageManipulatorBuilder {
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

  withBorders(
    coordinates: { x: string; y: string },
    size: { width: string; height: string },
    color: string
  ): ImageManipulatorBuilder {
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

  buildAndRun(outPath?: string): Promise<void> {
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

    if (!outPath) outPath = ImageManipulatorBuilder.generateTmpPath();
    return new Promise(async (res, rej) => {
      // Execute pipeline steps
      await Promise.all(this.pipeline.map(async (f) => await f()));
      this.ffmpegCommand
        .on("progress", (_) => {})
        .on("stderr", function (stderrLine) {
          console.log("Stderr output: " + stderrLine + "\n");
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

  private shiftFiltergraph() {
    this.lastInput = this.lastOutput;
    const lastFilterName =
      this.filters[this.filters.length - 1]?.filter || "base";
    this.lastOutput = `${lastFilterName}${this.filters.length}`;
  }

  private drawText(
    text: string,
    style: TextStyle,
    fontsDir?: string
  ): ImageManipulatorBuilder {
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
      filename: ImageManipulatorBuilder.sanitizePath(subFile),
      force_style: styleString,
    };
    if (fontsDir) {
      options["fontsdir"] = ImageManipulatorBuilder.sanitizePath(fontsDir);
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
