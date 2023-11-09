import { createLogger, format, transports } from "winston";
import { ILogger, ILoggerOpts } from "./logger-api.js";
import { env } from "node:process";

/**
 * Wrapper class around Winston simple log system
 * The problem with basic simple log is that it doesn't support
 * using an error in the options
 */
class plainTextWrapper implements ILogger {
  private simpleLog = createLogger({
    transports: [
      new transports.Console({
        format: format.simple(),
        level: env.LOG_LEVEL ?? "debug",
      }),
    ],
  });

  debug(message: string, opts?: ILoggerOpts): void {
    this.simpleLog.debug(this.includeErrIn(message, opts?.err));
  }

  error(message: string, opts?: ILoggerOpts): void {
    this.simpleLog.error(this.includeErrIn(message, opts?.err));
  }

  info(message: string, opts?: ILoggerOpts): void {
    this.simpleLog.info(this.includeErrIn(message, opts?.err));
  }

  warn(message: string, opts?: ILoggerOpts): void {
    this.simpleLog.warn(this.includeErrIn(message, opts?.err));
  }

  /**
   * Return another message including the error err if defined
   * @param message
   * @param err
   */
  includeErrIn(message: string, err: Error): string {
    // Args should be immutable
    let content = message;
    if (err !== undefined) content += err.toString();
    return content;
  }
}

export const plainTextLogger = new plainTextWrapper();
