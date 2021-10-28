#!/usr/bin/env node

import faker from 'faker'
import fs from 'fs'
import knex from 'knex'
import path from 'path'
import stream from 'stream'
import util from 'util'
import YAML from 'yaml'

import ConfigFile from './interfaces/ConfigFile'

async function main() {
  const [,, fileName] = process.argv
  const pipeline = await util.promisify(stream.pipeline)

  const filePath = path.join(process.cwd(), fileName)

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found')
  }

  if (!fileName.endsWith('.yml') || !fileName.endsWith('.yaml')) {
    throw new Error('File should have the yaml format')
  }

  const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf8' })

  const { config }: ConfigFile = YAML.parse(fileContent)

  const database = knex({
    client: 'pg',
    connection: {
      host : config.connection.host,
      port : config.connection.port,
      user : config.connection.user,
      password : config.connection.pass,
      database : config.connection.database
    }
  })

  await pipeline(
    async function* () {
      for (const table of config.tables) {
        for (const _ in Array(table.quantity).fill(null)) {
          const data: any = {}
      
          for (const column of table.columns) {
            if (column.value) {
              data[column.name] = column.value
            } else if (column.generator) {
              const [context, type] = column.generator.split('.')
              data[column.name] = faker[context][type]()
            }
          }
    
          yield {
            tableName: table.name,
            data
          }
        }
      }    
    },
    async function* (stream) {
      for await (const chunk of stream) {
        const { tableName, data } = chunk
        await database(tableName).insert(data)
      }
    }
  )

  database.destroy()
}

main()
