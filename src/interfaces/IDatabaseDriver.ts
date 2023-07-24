export interface IDatabaseDriver {
  checkConnection(): Promise<void>,
  insertInTable(table: string, data: { [key: string]: unknown }): Promise<void>
}
