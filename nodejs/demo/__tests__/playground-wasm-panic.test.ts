import { expect, describe, test, assert, beforeAll, afterAll } from 'vitest'
import { isWasmPanic, type WasmPanic } from '../src/utils/isWasmPanic'
import { WasmPanicRegistry } from '../src/utils/WasmPanicRegistry'
import { getWasmPanicError } from '../src/utils/getWasmPanicError'
import * as wasm from '../wasm/playground_wasm_panic'

describe('playground-wasm-panic', () => {

  describe('triggerPanic (no panic hook)', () => {
    test('panics result in "unreachable" RuntimeErrors', () => {
      const message = 'This is a test panic'
      const should_panic = true

      try {
        wasm.triggerPanic(message, should_panic)
        assert(false, 'unreachable')
      } catch (e) {
        expect(e instanceof Error).toBeTruthy()
        expect(e.name).toEqual('RuntimeError')
        expect(e.message).toEqual('unreachable')
        expect(isWasmPanic(e)).toBeTruthy()
      }
    })
  })

  describe('triggerPanicWithRegistry (with panic hook)', () => {
    const globalWithWasm = global as typeof global & {
      WASM_PANIC_REGISTRY?: WasmPanicRegistry
    }
    
    beforeAll(() => {
      /**
       * Set up a global registry for Wasm panics.
       * This allows us to retrieve the panic message from the Wasm panic hook,
       * which is not possible otherwise.
       */
      globalWithWasm.WASM_PANIC_REGISTRY = new WasmPanicRegistry()
    })

    afterAll(() => {
      globalWithWasm.WASM_PANIC_REGISTRY = undefined
      delete globalWithWasm.WASM_PANIC_REGISTRY
    })

    test('panics result in "unreachable" RuntimeErrors', () => {
      const message = 'This is a test panic'
      const should_panic = true

      try {
        wasm.triggerPanicWithRegistry(message, should_panic)
        assert(false, 'unreachable')
      } catch (e) {
        expect(e instanceof Error).toBeTruthy()
        expect(e.name).toEqual('RuntimeError')
        expect(e.message).toEqual('unreachable')
        expect(isWasmPanic(e)).toBeTruthy()
      }
    })
  })
})
