import { injectable } from "inversify";
import { tmpdir } from "node:os";
import { createWriteStream } from "node:fs";
import fetch from "node-fetch";
import {
  IImageDownloader,
  ImageDownloaderError,
} from "./image-downloader-api.js";
import { pipeline } from "node:stream/promises";
import { SmartFilePtr } from "../../utils/smart-file-ptr.js";

@injectable()
export class ImageDownloader implements IImageDownloader {
  /**
   * Download a file in a temporary folder and return its url
   * @throws ImageDownloaderError if the file couldn't be downloaded
   * @param url
   */
  async download(url: string): Promise<SmartFilePtr> {
    const path = `${tmpdir()}/axios-tmp-img-${Date.now()}`;
    let res = await fetch(url);
    if (!res.ok)
      throw new ImageDownloaderError(
        `url ${url} coudn't be downloaded. Error : ${res.statusText}`,
      );
    await pipeline(res.body, createWriteStream(path));

    return new SmartFilePtr(path);
  }
}
