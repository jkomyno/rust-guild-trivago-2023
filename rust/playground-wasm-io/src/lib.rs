use js_sys::{Function as JsFunction, Promise as JsPromise};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};
use wasm_bindgen_futures::JsFuture;

macro_rules! console_log {
  ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen(js_namespace = console)]
  fn log(s: &str);
}

/// Given a JsValue that wraps an asynchronous function, invoke it,
/// await the obtained Promise value, and return the result.
///
/// ```text
/// (arg: unknown) => Promise<unknown>
///     |
///     |  ┌ ─ ─ ─ ─ ─ ─    JsFunction::from()   ┌ ─ ─ ─ ─ ─ ─     
///     └ ─    JsValue  │─ ─ - - - - - - - - ──▶   JsFunction │
///        └ ─ ─ ─ ─ ─ ─                         └ ─ ─ ─ ─ ─ ─
///                                                     │
///                                      callN(JsValue::null(), ...args)?
///                                                     |
///                                                     ▼         The Promise
///        ┌ ─ ─ ─ ─ ─ ─     JsPromise::from()   ┌ ─ ─ ─ ─ ─ ─   starts running
///          JsPromise  │◀── ─ ─ - - - - - - - -    JsValue   │ ─ ─ ─ ─
///        └ ─ ─ ─ ─ ─ ─                         └ ─ ─ ─ ─ ─ ─         │
///              |
///       JsFuture::from()                                             │
///              |                                    ┌ ─ ─ ─ ─ ─ ─    
///              ▼                                      Result<    |   │
///        ┌ ─ ─ ─ ─ ─ ─  .await / JsFuture::poll()   |   JsValue,
///           JsFuture  │─ ─ - - - - - - - - - - - ──▶    JsValue, |   |
///        └ ─ ─ ─ ─ ─ ─                              | >            ◀─
///                                                    ─ ─ ─ ─ ─ ─ ┘                                                       
/// ```
#[wasm_bindgen]
pub async fn call_async_fn(async_fn: JsValue, arg1: JsValue) -> Result<JsValue, JsValue> {
  let async_fn = JsFunction::from(async_fn);

  console_log!("[rust] Calling async fn from Rust...");

  // free functions are not class methods, hence their `this` argument is `null`
  let this = JsValue::null();
  let promise: JsValue = async_fn.call1(&this, &arg1)?;

  console_log!("[rust] Async fn is running");

  let promise: JsPromise = JsPromise::from(promise);
  let future: JsFuture = JsFuture::from(promise);

  console_log!("[rust] Awaiting promise...");

  let result = future.await?;

  console_log!("[rust] Promise resolved with: {:?}", result);
  Ok(result)
}
