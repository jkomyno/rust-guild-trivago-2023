import * as fs from 'fs/promises'
import { call_async_fn } from '../wasm/playground_wasm_io'

const readFile = (filename: string): Promise<String> => {
  return fs.readFile(filename, { encoding: 'utf8' })
}

async function main() {
  const packageContent = await call_async_fn(readFile, './io.txt')
  console.log()
  console.log('[node] File content:', packageContent)
}

main()
