import { Channel, Guild } from "discord.js";
import { DatabaseConnector } from "../connector";
import { Logger } from "../../logger";
import UserWithDrawData, {
  UserTicketsData,
} from "../../../models/database/userWithDraw-model";
import { GuildsDrawData } from "../../../models/database";
import DrawSessionData, {
  DrawSessionResultData,
  DrawSessionResultsDataListed,
  DrawSessionWithGuildData,
} from "../../../models/database/drawSession-model";
import { Metadata } from "../../../models";

export class DrawRepo {
  constructor(private db: DatabaseConnector) {}

  public async getGuildsDraw(
    guildDiscordId: string
  ): Promise<GuildsDrawData | undefined> {
    try {
      let guildDraw = await this.db.executeFunction("getGuildsDraw", [
        guildDiscordId,
      ]);

      return guildDraw[0];
    } catch (err) {
      Logger.error(`[DrawRepo-getGuildsDraw]: `, err);
      throw err;
    }
  }

  public async setupGuildsDraw(
    guild: Guild,
    channel: Channel,
    drawTime: string,
    prize: string
  ): Promise<string | undefined> {
    try {
      await this.db.executeProcedure("guildAdd", [
        guild.id,
        channel.id,
        prize,
        drawTime,
      ]);

      return guild.id;
    } catch (err) {
      Logger.error(`[DrawRepo-createDraw]: `, err);
      throw err;
    }
  }

  public async createDrawSession(
    drawSessionId: string,
    guildDiscordId: string
  ) {
    try {
      await this.db.executeProcedure("generateNewDrawSession", [
        drawSessionId,
        guildDiscordId,
      ]);

      return drawSessionId;
    } catch (err) {
      Logger.error(`[DrawRepo-createDrawSession]: `, err);
      throw err;
    }
  }

  public async getUsersTicket(
    drawSessionId: string
  ): Promise<UserWithDrawData[]> {
    try {
      return await this.db.executeFunction("getUsersTicket", [drawSessionId]);
    } catch (err) {
      Logger.error(`[DrawRepo-getUsersTicket]: `, err);
      throw err;
    }
    return [];
  }

  public async getLatestDrawSession(
    guildDiscordId: string
  ): Promise<DrawSessionWithGuildData | undefined> {
    try {
      let guild = await this.getGuildsDraw(guildDiscordId);
      let drawSession = await this.db.executeFunction("getLatestDrawSession", [
        guildDiscordId,
      ]);

      if (!guild || drawSession.length === 0) return;

      let obj: DrawSessionWithGuildData = {
        guild,
        drawSession: drawSession[0],
      };

      return obj;
    } catch (err) {
      Logger.error(`[DrawRepo-getLatestDrawSession]: `, err);
      throw err;
    }
  }

  public async storeUserTicket(
    drawSessionId: string,
    userDiscordId: string,
    number: number
  ): Promise<string | undefined> {
    try {
      await this.db.executeProcedure("storeUserTicket", [
        drawSessionId,
        userDiscordId,
        number,
      ]);
      return drawSessionId;
    } catch (err) {
      Logger.error(`[DrawRepo-storeUserTicket]: `, err);
      throw err;
    }
  }

  public async updateDrawSession(drawSession: DrawSessionData) {
    try {
      await this.db.executeProcedure("updateDrawSession", [
        drawSession.id,
        drawSession.result,
      ]);
    } catch (err) {
      Logger.error(`[DrawRepo-updateDrawSession]: `, err);
      throw err;
    }
  }

  public async checkUserAlreadyJoined(
    drawSession: DrawSessionData,
    userDiscordId: string
  ): Promise<Boolean> {
    try {
      let ticket = await this.db.executeFunction("getUserTicket", [
        drawSession.id,
        userDiscordId,
      ]);

      return ticket.length !== 0;
    } catch (err) {
      Logger.error(`[DrawRepo-checkUserAlreadyJoined]: `, err);
      throw err;
    }
  }

  public async getUserTickets(
    guildDiscordId: string,
    userDiscordId: string,
    metadata: Metadata
  ): Promise<UserTicketsData> {
    try {
      let tickets = await this.db.executeFunction("getUserTickets", [
        guildDiscordId,
        userDiscordId,
        metadata.page,
        metadata.pageSize,
      ]);

      return new UserTicketsData(tickets, metadata);
    } catch (err) {
      Logger.error(`[DrawRepo-getUserTickets]: `, err);
      throw err;
    }
  }

  public async getDrawSessionResult(
    guildDiscordId: string,
    userDiscordId: string,
    drawSessionId?: string
  ): Promise<DrawSessionResultData> {
    try {
      let result = await this.db.executeFunction("getDrawSessionResult", [
        guildDiscordId,
        userDiscordId,
        drawSessionId,
      ]);

      return result[0];
    } catch (err) {
      Logger.error(`[DrawRepo-getDrawSessionResult]: `, err);
      throw err;
    }
  }

  public async getDrawSessionResults(
    guildDiscordId: string,
    metadata: Metadata
  ): Promise<DrawSessionResultsDataListed> {
    try {
      let results = await this.db.executeFunction("getDrawSessionResults", [
        guildDiscordId,
        metadata.page,
        metadata.pageSize,
      ]);

      return results;
    } catch (err) {
      Logger.error(`[DrawRepo-getDrawSessionResults]: `, err);
      throw err;
    }
  }
}
