import { Client, Pool, PoolConfig } from "pg";
import { SqlUtils } from "../../utils";
import { Logger } from "../logger";

export class DatabaseConnector {
  private pool: Pool;
  private client: Client;

  constructor(private dbConfig: PoolConfig) {
    this.pool = new Pool(dbConfig);
    this.client = new Client(dbConfig);
    this.reconnect();
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async reconnect(): Promise<void> {
    try {
      Logger.info("[DATABASE]: Connecting to database...");
      await this.client.connect();
      Logger.info("[DATABASE]: Connected to database");
    } catch (err) {
      Logger.error("[DATABASE]: Can not connect to database", err);
    }
  }

  public async executeProcedure(name: string, params: any[]): Promise<any> {
    let sql = SqlUtils.createSqlProcedure(name, params);

    return (await this.pool.query(sql, params)).rows;
  }

  public async executeFunction(name: string, params: any[]): Promise<any> {
    let sql = SqlUtils.createSqlFunction(name, params);

    return (await this.pool.query(sql, params)).rows;
  }
}
