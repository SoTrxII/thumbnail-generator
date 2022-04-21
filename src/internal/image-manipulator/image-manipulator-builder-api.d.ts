import { Alignment } from "./image-manipulator-builder";

export interface TextStyle {
  Name?: string;
  Fontname?: string;
  Fontsize?: number;
  PrimaryColour?: string;
  SecondaryColour?: string;
  OutlineColour?: string;
  BackColour?: string;
  Bold?: string;
  Italic?: string;
  Underline?: string;
  StrikeOut?: string;
  ScaleX?: number;
  ScaleY?: number;
  Spacing?: string;
  Angle?: string;
  BorderStyle?: string;
  Outline?: number;
  Shadow?: number;
  Alignment?: number;
  MarginL?: string | number;
  MarginR?: string | number;
  MarginV?: string | number;
  Encoding?: string;
}

export interface IImageManipulatorBuilder {
  withBackgroundImage(path: string): IImageManipulatorBuilder;

  withTextAt(
    text: string,
    coordinates: { x: string; y: string },
    size: number,
    color: string,
    font?: string,
    fontsDir?: string
  ): IImageManipulatorBuilder;

  withImageAt(
    imagePath: string,
    coordinates: { x: string; y: string },
    size: { width: string; height: string },
    rounded?: boolean,
    shadow?: boolean
  ): IImageManipulatorBuilder;

  withScaling(width: string, height: string): IImageManipulatorBuilder;

  withBorders(
    coordinates: { x: string; y: string },
    size: { width: string; height: string },
    color: string
  ): IImageManipulatorBuilder;

  withTextAligned(
    text: string,
    alignment: Alignment,
    margin: { x: number; y: number },
    size: number,
    color: string,
    font?: string,
    fontsDir?: string
  ): IImageManipulatorBuilder;

  addShadowToImage(inFile: string, outFile: string): Promise<void>;

  buildAndRun(outPath?: string): Promise<void>;
}
