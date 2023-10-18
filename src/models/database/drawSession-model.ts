import { GuildsDrawData } from "./guildsDraw-model";

export class DrawSessionWithGuildData {
  drawSession: DrawSessionData;
  guild: GuildsDrawData;

  constructor(drawSession: DrawSessionData, guild: GuildsDrawData) {
    this.drawSession = drawSession;
    this.guild = guild;
  }
}

export type DrawSessionResultData = DrawSessionData & {
  userChoice?: number;
};

export type DrawSessionResultsDataListed = (DrawSessionData & {
  totalPages: number;
})[];

type DrawSessionData = {
  id: string;
  guildDiscordId: string;
  result?: number;
  drawAt?: string;
};

export default DrawSessionData;
