import { expect, describe, test, assert } from 'vitest'
import { isWasmPanic } from '../src/utils/isWasmPanic'
import * as wasm from '../wasm/schema_parser_wasm'

describe('schema-parser-wasm', () => {
  describe('parseSchema', () => {
    test('valid schema is parsed successfully', () => {
      const schema = `
        datasource db {
          provider = "postgres"
          url = env("DATABASE_URL")
        }
      `

      const expectedAST: wasm.SchemaAST = {
        "datasources": [
          {
            "_tag": "db",
            "value": {
              "provider": "postgres",
              "url": {
                "_tag": "env",
                "value": "DATABASE_URL"
              }
            }
          }
        ]
      };

      expect(wasm.parseSchema(schema)).toEqual(expectedAST)
    })

    test('parsing invalid schemas results in an error', () => {
      const schema = `
        datasource db {
          provider = "postgres"
          url = env()
      `

      try {
        wasm.parseSchema(schema)
        assert(false, 'unreachable')
      } catch (e) {
        expect(e instanceof Error).toBeTruthy()
        expect(e.message).toMatch('Invalid syntax detected')
      }
    })
  })

  describe('validateAST', () => {
    test('success', () => {
      const schema = `
        datasource db {
          provider = "sqlite"
          url = "file:./dev.db"
        }
      `

      const ast: wasm.SchemaAST = wasm.parseSchema(schema)
      wasm.validateAST(ast)
    })

    test('error', () => {
      const schema = `
        datasource db {
          provider = "cockroachdb"
          url = "postgres://jkomyno:prisma@localhost:5432"
        }
    
        datasource db {
          provider = "postgres"
          url = "mysql://jkomyno:prisma@localhost:5432"
        }
      `

      const ast: wasm.SchemaAST = wasm.parseSchema(schema)

      try {
        // This throws an error because:
        // - more than one datasource is provided
        // - the cockroachdb provider is not supported
        // - the url for postgres doesn't start with the "postgres://" protocol
        wasm.validateAST(ast)
        assert(false, 'unreachable')
      } catch (e) {
        expect(e instanceof Error).toBeTruthy()
        expect(e.name).toEqual('Error')
      }
    })

    test('panic', () => {
      const schema = /* prisma */ `
        datasource db {
          provider = "cockroachdb"
          url = env("DATABASE_URL")
        }
      `

      const ast: wasm.SchemaAST = wasm.parseSchema(schema)

      try {
        // This panics because:
        // - env URLs handling is not implemented yet
        wasm.validateAST(ast)
        assert(false, 'unreachable')
      } catch (e) {
        expect(e instanceof Error).toBeTruthy()
        expect(e.name).toEqual('RuntimeError')
        expect(e.message).toEqual('unreachable')
        expect(isWasmPanic(e)).toBeTruthy()
      }
    })
  })


  describe('validateASTErrAsString', () => {
    test('error', () => {
      const schema = `
        datasource db {
          provider = "cockroachdb"
          url = "postgres://jkomyno:prisma@localhost:5432"
        }
    
        datasource db {
          provider = "postgres"
          url = "mysql://jkomyno:prisma@localhost:5432"
        }
      `

      const ast: wasm.SchemaAST = wasm.parseSchema(schema)

      try {
        // This throws because:
        // - more than one datasource is provided
        // - the cockroachdb provider is not supported
        // - the url for postgres doesn't start with the "postgres://" protocol
        wasm.validateASTErrAsString(ast)
        assert(false, 'unreachable')
      } catch (e) {
        expect(typeof e, 'string')
        expect(e instanceof Error).toBeFalsy()
      }
    })
  })
})
