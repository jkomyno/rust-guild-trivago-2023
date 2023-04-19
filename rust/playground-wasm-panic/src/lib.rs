use std::panic;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
extern "C" {
  /// This function registers the reason for a Wasm panic via the
  /// JS function `globalThis.WASM_PANIC_REGISTRY.setMessage()`
  #[wasm_bindgen(js_namespace = ["global", "WASM_PANIC_REGISTRY"], js_name = "setMessage")]
  fn wasm_panic_set_message(s: &str);
}

/// Registers a singleton panic hook that will register the reason for the Wasm panic in JS.
/// Without this, the panic message would be lost: you'd see `RuntimeError: unreachable` message in JS,
/// with no reference to the Rust function and line that panicked.
/// This function should be manually called before any other public function in this module.
/// Note: no method is safe to call after a panic has occurred.
fn wasm_panic_register_hook() {
  use std::sync::Once;
  static SET_HOOK: Once = Once::new();

  SET_HOOK.call_once(|| {
    // The panic hook is invoked when a thread panics, but before the panic runtime is invoked.
    panic::set_hook(Box::new(|info| {
      let message = &info.to_string();
      wasm_panic_set_message(message);
    }));
  });
}

#[wasm_bindgen(js_name = triggerPanicWithRegistry)]
pub fn trigger_panic_wasm_with_registry(message: &str, should_panic: bool) {
  wasm_panic_register_hook();
  trigger_panic(message, should_panic);
}

#[wasm_bindgen(js_name = triggerPanic)]
pub fn trigger_panic_wasm(message: &str, should_panic: bool) {
  trigger_panic(message, should_panic);
}

#[no_mangle]
pub fn trigger_panic(message: &str, should_panic: bool) {
  if should_panic {
    // println! disappears in Wasm
    println!("Preparing to trigger a panic: {}", message);
    panic!("{}", message);
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[should_panic(expected = "This is a test panic")]
  #[test]
  fn triggers_a_panic_with_the_given_message() {
    let message = "This is a test panic";
    trigger_panic(message, true)
  }

  #[test]
  fn does_not_panic() {
    let message = "This is a test panic";
    trigger_panic(message, false)
  }
}
