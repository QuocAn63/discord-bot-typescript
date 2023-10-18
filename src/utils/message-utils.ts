import {
  DiscordAPIError,
  Embed,
  Message,
  MessageCreateOptions,
  RESTJSONErrorCodes,
  TextBasedChannel,
  User,
} from "discord.js";

const IGNORED_ERRORS = [
  RESTJSONErrorCodes.UnknownMessage,
  RESTJSONErrorCodes.UnknownChannel,
  RESTJSONErrorCodes.UnknownGuild,
  RESTJSONErrorCodes.UnknownUser,
  RESTJSONErrorCodes.UnknownInteraction,
  RESTJSONErrorCodes.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
  RESTJSONErrorCodes.ReactionWasBlocked, // User blocked bot or DM disabled
];

export class MessageUtils {
  public static async send(
    target: User | TextBasedChannel,
    content: string | Embed | MessageCreateOptions
  ): Promise<Message | undefined> {
    try {
      let options: MessageCreateOptions =
        typeof content === "string"
          ? { content }
          : content instanceof Embed
          ? { embeds: [content] }
          : content;

      return await target.send(options);
    } catch (err) {
      if (
        err instanceof DiscordAPIError &&
        IGNORED_ERRORS.includes(err.code as number)
      ) {
        return;
      } else {
        throw err;
      }
    }
  }
}
