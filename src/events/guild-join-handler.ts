import { Guild } from "discord.js";
import { Logger } from "../services/logger";
import { EventHandler } from "./event-handler";

export class GuildJoinHandler implements EventHandler {
    public async process(guild: Guild): Promise<void> {
        Logger.info(`${guild.name} (${guild.id}) joined.`)
    }
}