import { injectable } from "inversify";
import { tmpdir } from "node:os";
import { createWriteStream, promises } from "node:fs";
import fetch from "node-fetch";
import { IImageDownloader } from "./image-downloader-api.js";
import { pipeline } from "node:stream/promises"

export class ImageDownloaderError extends Error {}

@injectable()
export class ImageDownloader implements IImageDownloader {
  private downloadedFiles: string[] = [];

  /**
   * Download a file in a temporary folder and return its url
   * @throws ImageDownloaderError if the file couldn't be downloaded
   * @param url
   */
  async download(url: string): Promise<string> {
    const imagePath = `${tmpdir()}/axios-tmp-img-${Date.now()}`;
    let res = await fetch(url);
    if (!res.ok)
      throw new ImageDownloaderError(
        `url ${url} coudn't be downloaded. Error : ${res.statusText}`,
      );
    await pipeline(res.body, createWriteStream(imagePath));
    this.downloadedFiles.push(imagePath);
    return imagePath;
  }

  /**
   * Cleanup all files downloaded during the object lifetime
   */
  async cleanUp(): Promise<void[]> {
    return Promise.all(
      this.downloadedFiles.map(async (dl) => await promises.unlink(dl)),
    );
  }
}
