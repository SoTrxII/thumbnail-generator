import { injectable } from "inversify";
import { tmpdir } from "os";
import { createWriteStream, promises } from "fs";
import fetch from "node-fetch";
import { promisify } from "util";
import { IImageDownloader } from "./image-downloader-api";

const streamPipeline = promisify(require("stream").pipeline);

export class ImageDownloaderError extends Error {}

@injectable()
export class ImageDownloader implements IImageDownloader {
  private downloadedFiles: string[] = [];

  /**
   * Modifies some URIs to get a better image result
   * @private
   */
  private static applyModifiers(url: string): string {
    // On cloudinary, we can't get a significant better result by applying their sharpen filter
    if (url.includes("res.cloudinary.com")) {
      const PARAM_REG = /image\/upload\/(?![?!^v])([^\/]+)\//;
      const SHARPEN_FILTER = "w_1280,ar_16:9,c_fill,g_auto,e_sharpen";
      const params = url.match(PARAM_REG)[1];
      if (!params) return url;
      return url.replace(params, SHARPEN_FILTER);
    }
    // If the URL isn't special, return it as is
    return url;
  }

  /**
   * Download a file in a temporary folder and return its url
   * @throws ImageDownloaderError if the file couldn't be downloaded
   * @param url
   */
  async download(url: string): Promise<string> {
    const imagePath = `${tmpdir()}/axios-tmp-img-${Date.now()}`;
    let res = await fetch(ImageDownloader.applyModifiers(url));
    if (!res.ok)
      throw new ImageDownloaderError(
        `url ${url} coudn't be downloaded. Error : ${res.statusText}`
      );
    await streamPipeline(res.body, createWriteStream(imagePath));
    this.downloadedFiles.push(imagePath);
    return imagePath;
  }

  /**
   * Cleanup all files downloaded during the object lifetime
   */
  async cleanUp(): Promise<void[]> {
    return Promise.all(
      this.downloadedFiles.map(async (dl) => await promises.unlink(dl))
    );
  }
}
