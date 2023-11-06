export interface Image extends AsyncDisposable {
  path: string;
}
export interface IImageDownloader {
  download(url: string): Promise<Image>;
}
