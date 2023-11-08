import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resPath = join(__dirname, "/../assets/");
const imgPath = join(resPath, "images/");
export const fontPath = join(resPath, "fonts/");

export enum ImageResource {
  BACKGROUND_BLUE_NATURE = "background-blue-nature.jpg",
  BACKGROUND_PINK = "background-pink.jpg",
  GM_AVATAR = "gm_avatar.png",
  LOGO = "logo.png",
  ROUND_GM_AVATAR = "round_gm_avatar.png",
  SAMPLE_RPG_THUMBNAIL = "sample_rpg_thumbnail.png",
}

export enum FontResource {
  LIBERATION_MONO = "liberation-mono/LiberationMono-Regular.ttf",
  LIBERATION_MONO_BOLD = "liberation-mono/LiberationMono-Bold.ttf",
  LIBERATION_MONO_ITALIC = "liberation-mono/LiberationMono-Italic.ttf",
  LIBERATION_MONO_BOLD_ITALIC = "liberation-mono/LiberationMono-BoldItalic.ttf",
}

export function getImg(r: ImageResource): string {
  return join(imgPath, r);
}

export function getFont(r: FontResource): string {
  return join(fontPath, r);
}
