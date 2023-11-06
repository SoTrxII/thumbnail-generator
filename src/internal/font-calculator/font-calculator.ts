import { injectable } from "inversify";
import { openSync, Font } from "fontkit";
import { FontPixelSize, IFontCalculator } from "./font-calculator-api.js";

@injectable()
export class FontCalculator implements IFontCalculator {
  // Max size of a letter, in pt
  private static readonly MAX_FONT_SIZE = 250;
  // Min size of a letter, in pt
  private static readonly MIN_FONT_SIZE = 1;
  // Admissible margin of error
  private static readonly FONT_MARGIN = 1;

  // Font to use to calculate
  private _font: Font;

  /**
   * Read a font from the provided path
   * @param fontInit
   */
  set font(fontInit: string) {
    this._font = openSync(fontInit);
  }

  get fullName() {
    return this._font.fullName;
  }

  get familyName() {
    return this._font.familyName;
  }

  /**
   * Get the width (in pixels) of the given string
   * @param string string to get the size of
   * @param fontSize Font size to use (in pt)
   * @return number Calculated width
   */
  getWidthOf(string: string, fontSize: number): number {
    const bbox = this._font.layout(string).bbox;
    return (
      this.convertToPixel(this.ceiling(bbox.maxX) - this.floor(bbox.minX)) *
      this.ptToEm(fontSize)
    );
  }

  /**
   * Return the number of lines needed to write "string" on a screen of
   * "screenWidth" width with a font size of "FontSize"
   * @param string string to get the size of
   * @param fontSize Font size to use (in pt)
   * @param screenWidth Width of the screen to use (in px)
   * @return number Calculated lines
   */
  getNbLinesOf(string: string, fontSize: number, screenWidth: number): number {
    const width = this.getWidthOf(string, fontSize);
    return Math.ceil(width / screenWidth);
  }

  /**
   * 26.6 vector format round grid fitting
   * @param x
   */

  /*private round(x): number {
        return (x + 32) & -64;
      }*/

  /**
   * Return the height needed to write string on a screen of screenwidth width
   * @param string
   * @param fontSize
   * @param screenWidth
   */
  getHeightOf(string: string, fontSize: number, screenWidth: number): number {
    const width = this.getWidthOf(string, fontSize);
    const nbLines = Math.ceil(width / screenWidth);
    const bbox = this._font.layout(string).bbox;
    const heightSingleLine =
      this.convertToPixel(this.ceiling(bbox.maxY) - this.floor(bbox.minY)) *
      this.ptToEm(fontSize);
    return (
      heightSingleLine * nbLines +
      this.convertToPixel(this.ceiling(this._font.lineGap)) *
        (nbLines - 1) *
        // multiply by 2 to add more weight to multiple lines
        (fontSize * 2)
    );
  }

  getSizeOf(
    string: string,
    fontSize: number,
    screenWidth: number,
  ): FontPixelSize {
    return {
      height: this.getHeightOf(string, fontSize, screenWidth),
      width: this.getWidthOf(string, fontSize) % screenWidth,
    };
  }

  /**
   * Return the ideal font size for "string" to fit in "screen"
   * @param string what to write on the screen
   * @param screen width and height of the canvas to write on, in px
   * @returns number fond font size
   */
  getIdealFontSizeForScreen(
    string: string,
    screen: { width: number; height: number },
  ): number {
    return this.checkFontForScreenWorker(
      string,
      screen,
      FontCalculator.MIN_FONT_SIZE,
      FontCalculator.MAX_FONT_SIZE,
      FontCalculator.FONT_MARGIN,
    );
  }

  /**
   * 26.6 vector format upper grid fitting
   * @param x
   */
  private ceiling(x): number {
    return (x + 63) & -64;
  }

  /**
   * 26.6 vector format lower grid fitting
   * @param x
   */
  private floor(x): number {
    return x & -64;
  }

  /**
   * Convert a size in px to em
   * @param x px input
   * @returns x em output
   * @private
   */
  private convertToPixel(x): number {
    return x / 64;
  }

  /**
   * Convert a size in px to em
   * @param x px input
   * @returns x em output
   * @private
   */
  private pxToEm(x): number {
    return x / 10;
  }

  /**
   * Convert a size in pt to em
   * @param x pt input
   * @returns x em output
   * @private
   */
  private ptToEm(x): number {
    return x * 0.083645834169792;
  }

  /**
   * Bounded search of an ideal font size for a given screen
   * @param string what to write on the screen
   * @param screen width and height of the canvas to write on, in px
   * @param min minimum font size (pt)
   * @param max maximum font size (pt)
   * @param delta Admissible margin of error for stop condition.
   * @returns number found font size
   * @private
   */
  private checkFontForScreenWorker(
    string,
    screen: { width: number; height: number },
    min: number,
    max: number,
    delta: number,
  ): number {
    let fontSize = Math.floor((max + min) / 2);
    let size = this.getSizeOf(string, fontSize, screen.width);
    // It reached equilibrium, we have to stop iterating
    if (max >= min - delta && max <= min + delta) {
      return fontSize;
    }
    // The string doesn't fit the screen, let's try with a smaller font size
    if (size.height > screen.height || size.width > screen.width) {
      return this.checkFontForScreenWorker(
        string,
        screen,
        min,
        fontSize,
        delta,
      );
    }
    // We still have some room, increase the font size
    else {
      return this.checkFontForScreenWorker(
        string,
        screen,
        fontSize,
        max,
        delta,
      );
    }
  }
}
