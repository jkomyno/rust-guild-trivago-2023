import { parseSchema } from '../wasm/schema_parser_wasm'
import type { SchemaAST } from '../wasm/schema_parser_wasm'

async function main() {
  await parseSuccess()
}

main()
  .catch()

async function parseSuccess() {
  const schema = /* prisma */ `

    datasource db {
      provider = "postgres"
      url = env("DATABASE_URL")
    }
  
  `

  console.info('Parsing schema...\n')
  const ast: SchemaAST = parseSchema(schema)
  console.info('Schema parsed successfully:\n')

  console.log(JSON.stringify(ast, null, 2))
}
