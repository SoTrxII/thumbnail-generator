export interface FontPixelSize {
  height: number;
  width: number;
}

export interface IFontCalculator {
  font: string | Buffer;
  familyName: string;
  fullName: string;

  getWidthOf(string: string, fontSize: number): number;

  getHeightOf(string: string, fontSize: number, screenWidth: number): number;

  getSizeOf(
    string: string,
    fontSize: number,
    screenWidth: number,
  ): FontPixelSize;

  getIdealFontSizeForScreen(
    string: string,
    screen: { width: number; height: number },
  ): number;

  getNbLinesOf(string: string, fontSize: number, screenWidth: number): number;
}
