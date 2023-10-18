import { GuildsDrawData } from "./guildsDraw-model";
import UserData from "./user-model";

export class UserWithGuildData {
  guild: GuildsDrawData;
  user: UserData;

  constructor(guild: GuildsDrawData, user: UserData) {
    this.guild = guild;
    this.user = user;
  }
}

type userInGuild = {
  guildDiscordId: string;
  userDiscordId: string;
  totalWinValue: number;
};

export default userInGuild;
