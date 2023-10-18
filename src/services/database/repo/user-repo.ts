import { Logger } from "../../logger";
import { DatabaseConnector } from "../connector";

export class UserRepo {
  constructor(private db: DatabaseConnector) {}
  public async createUserIfNotExists(userDiscordId: string): Promise<void> {
    try {
      await this.db.executeProcedure("createUserIfNotExists", [userDiscordId]);
    } catch (err) {
      Logger.error("[UserRepo-createUserIfNotExists]:", err);
      throw err;
    }
  }
}
