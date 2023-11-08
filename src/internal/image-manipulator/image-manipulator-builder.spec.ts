import "reflect-metadata";
import {
  Alignment,
  ImageManipulatorBuilder,
} from "./image-manipulator-builder.js";
import { IImageManipulatorBuilder } from "./image-manipulator-builder-api.js";
import { tmpdir } from "os";
import { getImg, ImageResource } from "../../test-utils/resources.js";

describe("Image Manipulator Builder", () => {
  let manipulator: IImageManipulatorBuilder;

  beforeEach(() => {
    manipulator = new ImageManipulatorBuilder();
  });

  it("Should be able to default to a black background", async () => {
    await manipulator.buildAndRun();
  });
  it("Should use a custom background if specified", async () => {
    await manipulator
      .withBackgroundImage(getImg(ImageResource.BACKGROUND_BLUE_NATURE))
      .buildAndRun();
  });
  it("Should be able to add borders to the image", async () => {
    await manipulator
      .withBackgroundImage(getImg(ImageResource.BACKGROUND_BLUE_NATURE))
      .withBorders(
        {
          x: "5",
          y: "5",
        },
        {
          height: "10+ih",
          width: "10+iw",
        },
        "red",
      )
      .buildAndRun();
  });
  it("Should add text to the frame if specified", async () => {
    await manipulator
      .withTextAt(
        "Miaaaaaaaaaaou",
        { x: String(0), y: String(0) },
        100,
        "#ffffff",
      )
      .buildAndRun();
  });
  it("Should add text with custom font to the frame if specified", async () => {
    await manipulator
      .withTextAt(
        "Des",
        { x: String(0), y: String(0) },
        99,
        "#ffffff",
        "aaaaaaaaa",
      )
      .buildAndRun();
  });
  it("Should add an image to the frame if specified", async () => {
    await manipulator
      .withImageAt(
        getImg(ImageResource.LOGO),
        {
          x: String(1280 / 2),
          y: String(720 / 2),
        },
        {
          width: String(40),
          height: String(40),
        },
      )
      .buildAndRun();
  });
  it("Should add a rounded image to the frame if specified", async () => {
    await manipulator
      .withImageAt(
        getImg(ImageResource.GM_AVATAR),
        {
          x: String(1280 / 2),
          y: String(720 / 2),
        },
        {
          width: String(120),
          height: String(120),
        },
        true,
      )
      .buildAndRun();
  });
  it("Should add a shadow to a square image", async () => {
    await manipulator.addShadowToImage(
      getImg(ImageResource.GM_AVATAR),
      `${tmpdir()}/miaou.png`,
    );
  });
  it("Should add a rounded image to a round image", async () => {
    await manipulator.addShadowToImage(
      getImg(ImageResource.ROUND_GM_AVATAR),
      `${tmpdir()}/miaou.png`,
    );
  });
  it("Should add an image with a shadow to the frame if specified", async () => {
    await manipulator
      .withBackgroundImage(getImg(ImageResource.BACKGROUND_BLUE_NATURE))
      .withImageAt(
        getImg(ImageResource.GM_AVATAR),
        {
          x: String(0 / 2),
          y: String(0 / 2),
        },
        {
          width: String(120),
          height: String(120),
        },
        true,
        true,
      )
      .buildAndRun();
  });
  it("Background + Text", async () => {
    await manipulator
      .withBackgroundImage(getImg(ImageResource.BACKGROUND_BLUE_NATURE))
      .withScaling(String(1280), String(720))
      .withTextAt(
        "MIAOU",
        { x: String(1280 / 2), y: String(720 / 2) },
        60,
        "white",
      )
      .buildAndRun();
  });
  it("Text with special characters", async () => {
    await manipulator
      .withBackgroundImage(getImg(ImageResource.BACKGROUND_BLUE_NATURE))
      .withScaling(String(1280), String(720))
      .withTextAligned(
        "MIœAOU",
        Alignment.TOP_CENTER,
        { x: 0, y: 40 },
        100,
        "#ffffff",
      )
      .buildAndRun();
  });
  it("Should generate a composite frame", async () => {
    await manipulator
      .withBackgroundImage(getImg(ImageResource.BACKGROUND_BLUE_NATURE))
      .withScaling(String(1280), String(720))
      .withBorders(
        {
          x: "5",
          y: "5",
        },
        {
          height: "10+ih",
          width: "10+iw",
        },
        "blue",
      )
      .withImageAt(
        getImg(ImageResource.GM_AVATAR),
        {
          x: String(20),
          y: String(20),
        },
        {
          width: String(120),
          height: String(120),
        },
        true,
      )
      .withImageAt(
        getImg(ImageResource.LOGO),
        {
          x: String(20),
          y: "720-overlay_h - 20",
        },
        {
          width: String(120),
          height: String(120),
        },
      )
      .withTextAligned(
        "MIAOU",
        Alignment.TOP_CENTER,
        { x: 0, y: 40 },
        100,
        "#ffffff",
      )
      .withTextAligned(
        "\n\nChicken attack",
        Alignment.BOTTOM_CENTER,
        { x: 0, y: 30 },
        50,
        "#ffffff",
      )
      .withTextAligned("#1", Alignment.TOP_RIGHT, { x: 0, y: 0 }, 48, "#ffffff")
      .buildAndRun(`${tmpdir()}/meh.png`);
  });
});
