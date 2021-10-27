#!/usr/bin/env node

'use strict'

const faker = require('faker')
const fs = require('fs')
const knex = require('knex')
const path = require('path')
const YAML = require('yaml')

async function main() {
  const [,, fileName] = process.argv

  const filePath = path.join(process.cwd(), fileName)

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found')
  }

  if (!fileName.endsWith('.yaml') || !fileName.endsWith('.yaml')) {
    throw new Error('File should have the yaml format')
  }

  const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf8' })

  const { config } = YAML.parse(fileContent)

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

  for (const table of config.tables) {
    for (const _ in Array(table.quantity).fill(null)) {
      const data = {}
  
      for (const column of table.columns) {
        const [context, type] = column.generator.split('.')
        data[column.name] = faker[context][type]()
      }

      await database(table.name).insert(data)
    }
  }

  database.destroy()
}

main()
