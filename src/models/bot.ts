import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  Guild,
  Interaction,
  Message,
} from "discord.js";
import {
  ButtonHandler,
  CommandHandler,
  GuildJoinHandler,
  GuildLeaveHandler,
  MessageHandler,
} from "../events";
import { Logger } from "../services/logger";
import { PartialUtils } from "../utils";
import { JobService } from "../services";

export class Bot {
  private ready = false;

  constructor(
    private token: string,
    private client: Client,
    private guildJoinHandler: GuildJoinHandler,
    private guildLeaveHandler: GuildLeaveHandler,
    private commandHandler: CommandHandler,
    private messageHandler: MessageHandler,
    private buttonHandler: ButtonHandler,
    private jobService: JobService
  ) {}

  public async start() {
    this.registerLinsteners();
    this.client.login(this.token);
  }

  private registerLinsteners() {
    this.client.on("ready", () => this.onReady());
    this.client.on("messageCreate", (msg: Message) => this.onMessage(msg));
    this.client.on("interactionCreate", (intr: Interaction) =>
      this.onInteraction(intr)
    );
  }

  private async onInteraction(intr: Interaction): Promise<void> {
    if (!this.ready) {
      return;
    }

    if (intr instanceof CommandInteraction) {
      try {
        await this.commandHandler.process(intr);
      } catch (err) {
        Logger.error("Error when executing command", err);
      }
    } else if (intr instanceof ButtonInteraction) {
      try {
        await this.buttonHandler.process(intr, intr.message);
      } catch (err) {
        Logger.error("Error when executing button", err);
      }
    }
  }

  private async onReady(): Promise<void> {
    let userTag = this.client?.user?.tag;

    this.jobService.start();

    Logger.info(`[BOT_STATUS]: Client logged in as ${userTag}`);
    this.ready = true;
  }

  private async onGuildJoin(guild: Guild): Promise<void> {
    if (!this.ready) {
      return;
    }

    try {
      await this.guildJoinHandler.process(guild);
    } catch (err) {
      Logger.error(`[GUILD_JOIN_ERROR]: `, err);
    }
  }

  private async onGuildLeave(guild: Guild): Promise<void> {
    if (!this.ready) {
      return;
    }

    try {
      await this.guildLeaveHandler.process(guild);
    } catch (err) {
      Logger.error(`[GUILD_LEAVE_ERROR]: `, err);
    }
  }

  private async onMessage(msg: Message): Promise<void> {
    if (!this.ready) {
      return;
    }

    try {
      let newMsg = await PartialUtils.fillMessage(msg);

      if (!newMsg) return;
      await this.messageHandler.process(newMsg);
    } catch (err) {
      Logger.error(`onMessage`, err);
    }
  }
}
