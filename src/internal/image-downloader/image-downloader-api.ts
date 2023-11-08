export interface Image extends AsyncDisposable {
  path: string;
}
export class ImageDownloaderError extends Error {}

export interface IImageDownloader {
  download(url: string): Promise<Image>;
}
