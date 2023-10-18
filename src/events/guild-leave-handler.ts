import { Guild } from "discord.js";
import { EventHandler } from "./event-handler";
import { Logger } from "../services/logger";

export class GuildLeaveHandler implements EventHandler {
    public async process(guild: Guild): Promise<void> {
        Logger.info(`${guild.name} (${guild.id}) left.`)
    }
}