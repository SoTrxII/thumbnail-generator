import {unlink} from "node:fs/promises";
import {existsSync} from "fs";

/**
 * A file "pointer" that delete the file its pointing to when
 * out of scope
 */
export class SmartFilePtr implements AsyncDisposable {
  constructor(private resPath: string) {
    if (!existsSync(this.resPath))
      throw new Error(`Invalid image creation : ${this.resPath}`);
  }

  get path() {
    return this.resPath;
  }

  async [Symbol.asyncDispose]() {
    console.log("disposing of image " + this.path);
    try {
      await unlink(this.path);
    } catch (e) {
      console.warn("Couldn't delete image " + this.path);
    }
  }
}
