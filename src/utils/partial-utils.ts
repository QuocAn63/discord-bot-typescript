import {
  DiscordAPIError,
  Message,
  PartialMessage,
  RESTJSONErrorCodes,
} from "discord.js";

const IGNORED_ERRORS = [
  RESTJSONErrorCodes.UnknownMessage,
  RESTJSONErrorCodes.UnknownChannel,
  RESTJSONErrorCodes.UnknownGuild,
  RESTJSONErrorCodes.UnknownUser,
  RESTJSONErrorCodes.UnknownInteraction,
  RESTJSONErrorCodes.MissingAccess,
];

export class PartialUtils {
  public static async fillMessage(
    msg: Message | PartialMessage
  ): Promise<Message | undefined> {
    if (msg.partial) {
      try {
        return await msg.fetch();
      } catch (err) {
        if (
          err instanceof DiscordAPIError &&
          IGNORED_ERRORS.includes(err.code as number)
        )
          return;
        else throw err;
      }
    }

    return msg;
  }
}
