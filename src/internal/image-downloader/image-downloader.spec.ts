import "reflect-metadata";
import { ImageDownloader, ImageDownloaderError } from "./image-downloader.js";

describe("Image downloader", () => {
  const downloader = new ImageDownloader();
  it("Should download an existing image", async () => {
    const path = await downloader.download(
      "https://res.cloudinary.com/datfhmsze/image/upload/c_thumb,w_200,g_face/v1585771352/campaign_vampasse_tghqgm.jpg",
    );

    expect(path).not.toBeUndefined();
  });
  it("Should download error on a non-existing image", async () => {
    await expect(
      downloader.download(
        "https://res.cloudinary.com/datfhmsze/image/upload/c_thumb,w_200,g_face/v1585771352/campaign_vampadsffdsfdssfdsse_tghqgm.jpg",
      ),
    ).rejects.toThrow(ImageDownloaderError);
  });
});
