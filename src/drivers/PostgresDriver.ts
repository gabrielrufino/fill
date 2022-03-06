import knex, { Knex } from "knex";
import { IDatabaseDriver } from "../interfaces/IDatabaseDriver";
import { IDatabaseDriverParams } from "../interfaces/IDatabaseDriverParams";

export class PostgresDriver implements IDatabaseDriver {
    private readonly _connection: Knex

    constructor(params: IDatabaseDriverParams) {
        this._connection = knex({
            client: 'pg',
            connection: {
              host: params.host,
              port: params.port,
              user: params.user,
              password: params.password,
              database: params.database,
            },
        });
    }

    async checkConnection(): Promise<void> {
        await this._connection.raw('SELECT 1');
    }

    async insertInTable(table: string, data: { [key: string]: any }): Promise<void> {
        await this._connection(table).insert(data);
    }
}
