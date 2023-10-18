import { Channel, Guild } from "discord.js";
import { GuildsDrawData } from "../../../models/database";
import { DatabaseConnector } from "../connector";
import { Logger } from "../../logger";

export class GuildRepo {
  constructor(private db: DatabaseConnector) {}

  public async getGuildList(): Promise<GuildsDrawData[]> {
    try {
      let list = await this.db.executeFunction("getGuildList", []);

      return list;
    } catch (err) {
      Logger.error(`[Guild-Repo_setGuild]`, err);
      throw err;
    }
  }

  public async setGuild(
    guild: Guild,
    channel: Channel
  ): Promise<{ guildName: string; channelName: string } | undefined> {
    let guildId = guild.id;
    let channelId = channel.id;
    let guildDbId = `G-${new Date().getTime()}`;
    try {
      await this.db.executeProcedure("guildAdd", [
        guildDbId,
        guildId,
        channelId,
      ]);

      return { guildName: guild.name, channelName: channel.toString() };
    } catch (err) {
      Logger.error(`[Guild-Repo_setGuild]`, err);
    }
  }

  public async increaseUserTotalWin(
    guildDiscordId: string,
    userDiscordId: string
  ) {
    try {
      this.db.executeProcedure("increaseUserTotalWin", [
        guildDiscordId,
        userDiscordId,
      ]);
    } catch (err) {
      Logger.error(`[Guild-increaseUserTotalWin]`, err);
    }
  }

  public async checkUserInGuild(
    guildDiscordId: string,
    userDiscordId: string
  ): Promise<Boolean> {
    try {
      let user = await this.db.executeFunction("getUserInGuild", [
        guildDiscordId,
        userDiscordId,
      ]);

      return user.length !== 0;
    } catch (err) {
      Logger.error(`[Guild-setUserInGuild]`, err);
      return false;
    }
  }

  public async setUserInGuild(guildDiscordId: string, userDiscordId: string) {
    try {
      this.db.executeProcedure("setUserInGuild", [
        guildDiscordId,
        userDiscordId,
      ]);
    } catch (err) {
      Logger.error(`[Guild-setUserInGuild]`, err);
    }
  }
}
