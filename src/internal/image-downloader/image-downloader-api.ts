import { SmartFilePtr } from "../../utils/smart-file-ptr.js";

export class ImageDownloaderError extends Error {}

export interface IImageDownloader {
  download(url: string): Promise<SmartFilePtr>;
}
