"use strict";
require("reflect-metadata");
const { container } = require("#core/inversify.config.js");
const { TYPES } = require("#core/types.js");
const { resolve } = require("path");
const { readFile, unlink } = require("fs/promises");
const {
  InvalidPresetError,
  OptimizationError,
  ThumbnailSchemaError,
} = require("../src/pkg/thumbnail-generator/thumbnail-generator");

const DEFAULT = {
  aspectRatio: 16 / 9,
  size: { width: 1280, height: 720 },
  optimizeImage: false,
};

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
module.exports = async (event, context) => {
  const thg = container.get(TYPES.ThumbnailGenerator);
  // Check preset
  if (event.path === "/") {
    return userError(context, new Error("No preset has been specified"));
  }
  const preset = event.path.replace(/\//g, "");

  // Resolve options
  // OptimizeImage : boolean -> default false
  if (
    event.query.optimizeImage !== undefined &&
    event.query.optimizeImage !== true &&
    event.query.optimizeImage !== false
  ) {
    return userError(
      context,
      new Error("Invalid option provided : optimizeImage must be a boolean")
    );
  }
  const optimizeImage = event.query.optimizeImage ?? DEFAULT.optimizeImage;

  // Size
  // If neither width nor height is provided, default to 720p
  // If only one of them is provided, keep the aspect ratio of 16/9
  // An ok size is either undefined or a positive integer
  const isSizeValid = (size) =>
    size === undefined || (!isNaN(parseInt(size)) && Number(size) > 0);
  if (!isSizeValid(event.query.width) || !isSizeValid(event.query.height)) {
    return userError(
      context,
      new Error(
        "Invalid option provided : width and height must be positive integer if specified"
      )
    );
  }
  // Define width is only height is specified, define height if only width is specified
  if (event.query.width !== undefined && event.query.height === undefined) {
    event.query.height = Math.ceil(event.query.width / DEFAULT.aspectRatio);
  } else if (
    event.query.width === undefined &&
    event.query.height !== undefined
  ) {
    event.query.width = Math.ceil(event.query.height * DEFAULT.aspectRatio);
  }
  // Event at this point, a 1x1 size could make ffmpeg panic, but that's the user fault
  const width = event.query.width ?? DEFAULT.size.width;
  const height = event.query.height ?? DEFAULT.size.height;

  // Resolve args, which can be either in body or in QS
  // Using a body in a GET request is kind of weird
  // But there is a serious chance the url might get longer than 2000 character
  // Args validation is ensured by the preset itself
  const args = Object.assign(event.body, event.query);

  try {
    const path = await thg.buildWithPreset(preset, args, {
      size: { width: width, height: height },
      fontDir: resolve(__dirname, "assets/fonts/"),
      defaultFontPath: "liberation-mono/LiberationMono-Regular.ttf",
      optimizeImage: optimizeImage,
    });
    const fileBuffer = await readFile(path);
    unlink(path).catch(console.log);
    return context
      .status(200)
      .headers({
        "content-type": "image/png",
      })
      .succeed(fileBuffer);
  } catch (e) {
    switch (e.constructor.name) {
      // Instanceof is broken is JS when extending error type, so we're checking the class name
      case InvalidPresetError.name:
      case ThumbnailSchemaError.name:
        return userError(context, e);
      case OptimizationError.name:
      default:
        return context.status(500).fail(e);
    }
  }
};

function userError(context, e) {
  return context.status(400).fail(e);
}
