import { DiscordAPIError } from "discord.js";
import { pino } from "pino";

let logger = pino(
  {},
  pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "yyyy-mm-dd HH:MM:ss.l",
    },
  })
);

export class Logger {
  public static info(message: string, obj?: any) {
    obj ? logger.info(obj, message) : logger.info(message);
  }

  public static warn(message: string, obj?: any) {
    obj ? logger.warn(obj, message) : logger.info(message);
  }

  public static error(message: string, obj?: any) {
    if (!obj) {
      logger.error(message);
      return;
    }

    if (typeof obj === "string") {
      logger.child({ message: obj }).error(message);
    } else if (obj instanceof DiscordAPIError) {
      logger
        .child({
          message: obj.message,
          code: obj.code,
          statusCode: obj.status,
          method: obj.method,
          stack: obj.stack,
          path: obj.url,
        })
        .error(message);
    } else {
      logger.error(obj, message);
    }
  }
}
