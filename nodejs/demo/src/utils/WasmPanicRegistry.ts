export class WasmPanicRegistry {
  private message?: string

  get() {
    return `${this.message}`
  }

  // Don't use this method directly, it's only used by the Wasm panic hook in `playground-wasm-panic`.
  private setMessage(message: string) {
    console.log('setMessage was called with message:', message)
    this.message = `RuntimeError: ${message}`
  }
}
