import { unlink } from "node:fs/promises";
import { existsSync } from "fs";
import { container } from "../inversify.config.js";
import { TYPES } from "../types.js";
import { ILogger } from "../internal/logger/logger-api.js";
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
    // A bit of a service locator anti-pattern, but this will be an exception
    const logger = container.get<ILogger>(TYPES.Logger);
    logger.info("Deleting image " + this.path);
    try {
      await unlink(this.path);
    } catch (e) {
      logger.warn("Couldn't delete image " + this.path);
    }
  }
}
