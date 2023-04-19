import { WasmPanicRegistry } from './WasmPanicRegistry'
import { WasmPanic } from './isWasmPanic'

export const globalWithWasm = global as typeof global & {
  WASM_PANIC_REGISTRY: WasmPanicRegistry
}

export function getWasmPanicError(error: WasmPanic) {
  const message: string = globalWithWasm.WASM_PANIC_REGISTRY.get()
  const stack = [message, ...(error.stack || 'NO_BACKTRACE').split('\n').slice(1)].join('\n')

  return { message, stack }
}
