export class SqlUtils {
  public static createSqlProcedure(name: string, params: any[]): string {
    let sql = `call "${name}"(${new Array(params.length)
      .fill(0)
      .map((_, index) => `$${index + 1}`)
      .join(",")})`;

    return sql;
  }

  public static createSqlFunction(name: string, params: any[]): string {
    let sql = `select * from "${name}"(${new Array(params.length)
      .fill(0)
      .map((_, index) => `$${index + 1}`)
      .join(",")})`;

    return sql;
  }
}
