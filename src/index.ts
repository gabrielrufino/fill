#!/usr/bin/env node

import faker from 'faker';
import fs from 'fs';
import knex from 'knex';
import path from 'path';
import stream from 'stream';
import util from 'util';
import YAML from 'yaml';

import { clients } from './maps';
import { version as packageVersion } from '../package.json';
import ConfigFile from './interfaces/ConfigFile';

const generators: any = {
  ...faker,
};

async function main() {
  try {
    const [,, fileName] = process.argv;
    const pipeline = await util.promisify(stream.pipeline);

    const filePath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    if (!fileName.endsWith('.yml') && !fileName.endsWith('.yaml')) {
      throw new Error('File should have the yaml format');
    }

    const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf8' });

    const { version, config }: ConfigFile = YAML.parse(fileContent);

    if (String(version).split('.')[0] !== packageVersion.split('.')[0]) {
      throw new Error('Incorrect config file version');
    }

    const database = knex({
      client: clients.get(config.connection.type),
      connection: {
        host: config.connection.host,
        port: config.connection.port,
        user: config.connection.user,
        password: config.connection.pass,
        database: config.connection.database,
      },
    });

    await database.raw('SELECT 1');

    await pipeline(
      async function* () {
        for (const table of config.tables) {
          for (const _ in Array(table.quantity).fill(null)) {
            const data: any = {};

            for (const column of table.columns) {
              if (column.value) {
                data[column.name] = column.value;
              } else if (column.generator) {
                const [context, type] = column.generator.split('.');
                data[column.name] = generators[context][type]();
              }
            }

            yield {
              tableName: table.name,
              data,
            };
          }
        }
      },
      async function* (stream) {
        for await (const chunk of stream) {
          const { tableName, data } = chunk;
          await database(tableName).insert(data);
        }
      },
    );

    database.destroy();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      process.exit(1);
    }
  }
}

main();
