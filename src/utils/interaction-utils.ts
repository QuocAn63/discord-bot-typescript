import {
  CommandInteraction,
  DiscordAPIError,
  Embed,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  Message,
  MessageComponentInteraction,
  RESTJSONErrorCodes,
  WebhookMessageEditOptions,
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

export class InteractionUtils {
  public static async deferReply(
    intr: CommandInteraction | MessageComponentInteraction,
    hidden = false
  ): Promise<void> {
    try {
      await intr.deferReply({
        ephemeral: hidden,
      });
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

  public static async deferUpdate(intr: MessageComponentInteraction) {
    try {
      await intr.deferUpdate();
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

  public static async send(
    intr: CommandInteraction | MessageComponentInteraction,
    content: string | Embed | InteractionReplyOptions,
    hidden = false
  ): Promise<Message | void> {
    try {
      let options: InteractionReplyOptions =
        typeof content === "string"
          ? { content }
          : content instanceof Embed
          ? { embeds: [content] }
          : content;

      if (intr.deferred || intr.replied) {
        return (await intr.followUp({
          ...options,
          ephemeral: hidden,
        })) as Message;
      } else {
        return (await intr.reply({
          ...options,
          ephemeral: hidden,
          fetchReply: true,
        })) as Message;
      }
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

  public static async editReply(
    intr: CommandInteraction | MessageComponentInteraction,
    content: string | Embed | WebhookMessageEditOptions,
    hidden = false
  ): Promise<Message | void> {
    try {
      let options: WebhookMessageEditOptions =
        typeof content === "string"
          ? { content }
          : content instanceof Embed
          ? { embeds: [content] }
          : content;

      return (await intr.editReply(options)) as Message;
    } catch (err) {
      throw err;
    }
  }

  public static async update(
    intr: MessageComponentInteraction,
    content: string | Embed | InteractionUpdateOptions
  ): Promise<Message | void> {
    try {
      let options: InteractionUpdateOptions =
        typeof content === "string"
          ? { content }
          : content instanceof Embed
          ? { embeds: [content] }
          : content;
      return (await intr.update({
        ...options,
        fetchReply: true,
      })) as Message;
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        IGNORED_ERRORS.includes(error.code as number)
      ) {
        return;
      } else {
        throw error;
      }
    }
  }
}
