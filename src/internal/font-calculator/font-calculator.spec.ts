import "reflect-metadata";
import { FontCalculator } from "./font-calculator.js";
import { join } from "path";

const fontLocation = join(
  import.meta.url.replace("file://", ""),
  "../../../assets/fonts/liberation-mono/LiberationMono-Regular.ttf",
);
describe("Font calculator", () => {
  describe("Font loading", () => {
    it("Should load a font from a path", () => {
      const calculator = new FontCalculator();
      calculator.font = fontLocation;
      expect(() =>
        calculator.getWidthOf("L'horizon des évènements", 60),
      ).not.toThrow();
    });
  });
  describe("Calculations", () => {
    const calculator = new FontCalculator();
    beforeAll(() => {
      calculator.font = fontLocation;
    });
    it("Should get the width of a letter", () => {
      const width = calculator.getWidthOf("o", 60);
      expect(Math.ceil(width)).toBeGreaterThan(45);
      console.log(width);
    });
    it("Should get the width of a word", () => {
      const width = calculator.getWidthOf("des", 60);
      expect(width).toBeGreaterThan(120);
      console.log(width);
    });
    it("Should get the width of a string", () => {
      const width = calculator.getWidthOf("L'horizon des évènements", 60);
      expect(width).toBeGreaterThan(1280);
      console.log(width);
    });
    it("Should get the number of lines required to write a string", () => {
      const width = calculator.getNbLinesOf(
        "L'horizon des évènements",
        60,
        120,
      );
      // This is gigantic
      expect(width).toBeGreaterThan(15);
      console.log(width);
    });
    it("Should get the height of a string", () => {
      const width = calculator.getHeightOf(
        "L'horizon des évènements",
        60,
        1280,
      );
      expect(width).toBeGreaterThan(225);
      console.log(width);
    });

    it("Should calculate a font size for a specified screen size", () => {
      const fontSize = calculator.getIdealFontSizeForScreen(
        "L'horizon des évènements",
        { width: 960, height: 360 },
      );
      //const width = calculator.getHeightOf("L'horizon des évènements", 60, 1280);
      //expect(width).toBeGreaterThan(225);
      console.log(fontSize);
    });
  });
});
