import 'dotenv/config'
import { createClient } from '@libsql/client'
import { VECTOR_INIT_SQL } from './schema'

async function init() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  console.log('Creating vector tables and indexes...')

  for (const sql of VECTOR_INIT_SQL) {
    console.log(`  Running: ${sql.slice(0, 60)}...`)
    await client.execute(sql)
  }

  console.log('Done.')
  client.close()
}

init().catch(console.error)
