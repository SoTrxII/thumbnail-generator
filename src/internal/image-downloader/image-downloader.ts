import { injectable } from "inversify";
import { tmpdir } from "node:os";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import fetch from "node-fetch";
import {
  IImageDownloader,
  Image,
  ImageDownloaderError,
} from "./image-downloader-api.js";
import { pipeline } from "node:stream/promises";

@injectable()
export class ImageDownloader implements IImageDownloader {
  /**
   * Download a file in a temporary folder and return its url
   * @throws ImageDownloaderError if the file couldn't be downloaded
   * @param url
   */
  async download(url: string): Promise<Image> {
    const path = `${tmpdir()}/axios-tmp-img-${Date.now()}`;
    let res = await fetch(url);
    if (!res.ok)
      throw new ImageDownloaderError(
        `url ${url} coudn't be downloaded. Error : ${res.statusText}`,
      );
    await pipeline(res.body, createWriteStream(path));

    return {
      path,
      async [Symbol.asyncDispose]() {
        console.log("disposing of image " + path);
        try {
          await unlink(path);
        } catch (e) {
          console.warn("Couldn't delete image " + path);
        }
      },
    };
  }
}
