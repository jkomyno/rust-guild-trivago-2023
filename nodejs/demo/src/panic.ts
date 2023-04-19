import { triggerPanic, triggerPanicWithRegistry } from '../wasm/playground_wasm_panic'
import { WasmPanicRegistry } from './utils/WasmPanicRegistry'
import { getWasmPanicError, globalWithWasm } from './utils/getWasmPanicError'
import { WasmPanic } from './utils/isWasmPanic'

async function main() {
  const option = process.argv[2]

  switch (option) {
    case 'default':
      await panicDefault()
      break
    case 'registry':
      await panicRegistry()
      break
    default:
      console.error('Please specify a valid option: default, registry')
  }
}

main()

async function panicDefault() {
  console.info('Triggering panic (default, no panic hook)...\n')

  try {
    triggerPanic('This is a test panic', true)
  } catch (e) {
    const error = e as WasmPanic
    const { message, stack } = error
    console.log('[node:panic:default]', { message })
    console.info(stack)
  }
}

async function panicRegistry() {
  console.info('Triggering panic (registry, with panic hook)...\n')

  globalWithWasm.WASM_PANIC_REGISTRY = new WasmPanicRegistry()

  try {
    triggerPanicWithRegistry('This is a test panic', true)
  } catch (e) {
    const error = e as WasmPanic
    const { message, stack } = getWasmPanicError(error)
    console.log('[node:panic:registry]', { message })
    console.info(stack)
  }
}
