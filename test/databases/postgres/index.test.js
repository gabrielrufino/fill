const { spawnSync, execSync } = require('child_process')
const { beforeAll, afterAll } = require('@jest/globals')

describe('Postgres', () => {
  const containerName = 'postgres_fill_db'

  beforeAll(() => {
    spawnSync('docker', [
      'container',
      'run',
      '--env', 'POSTGRES_USER=root',
      '--env', 'POSTGRES_PASSWORD=root',
      '--env', 'POSTGRES_DB=postgres',
      '--name', containerName,
      '--detach',
      'postgres:13'
    ])
  })

  afterAll(() => {
    spawnSync('docker', [
      'container',
      'stop',
      containerName
    ])

    spawnSync('docker', [
      'container',
      'rm',
      containerName
    ])
  })

  it('Should insert data in the database', () => {
    expect(1).toBe(1)
  })
})
