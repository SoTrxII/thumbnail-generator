export interface IImageDownloader {
  download(url: string): Promise<string>;

  cleanUp(): Promise<void[]>;
}
