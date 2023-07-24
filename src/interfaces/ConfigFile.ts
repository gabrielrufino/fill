type Generator = `${string}.${string}`

export interface ConfigFile {
  version: number
  config: {
    connection: {
      type: string
      host: string
      port: number
      user: string
      pass: string
      database: string
    }
    tables: {
      name: string
      quantity: number
      columns: {
        name: string
        generator?: Generator
        value?: string | number
      }[]
    }[]
  }
}
