"use strict";
require("reflect-metadata");
const { container } = require("#core/inversify.config.js");
const { TYPES } = require("#core/types.js");
const { resolve } = require("path");
const { readFile, unlink } = require("fs/promises");
const thg = container.get(TYPES.ThumbnailGenerator);

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
  // Check preset
  if (event.path === "/") {
    return userError(context, new Error("No preset has been specified"));
  }
  const preset = event.path.replace(/\//g, "");

  // Using a body in a GET request is kind of weird
  // But there is a serious chance the url might get longer than 2000 character
  const args = Object.assign(event.body, event.query);
  try {
    const path = await thg.buildWithPreset(preset, args, {
      size: { width: 1280, height: 720 },
      fontDir: resolve(__dirname, "assets/fonts/"),
      defaultFontPath: "liberation-mono/LiberationMono-Regular.ttf",
      optimizeImage: false,
    });
    const fileBuffer = await readFile(path);
    await unlink(path);
    return context
      .status(200)
      .headers({
        "content-type": "image/png",
      })
      .succeed(fileBuffer);
  } catch (e) {
    return userError(context, e);
  }
};

function userError(context, e) {
  return context.status(400).fail(e);
}
