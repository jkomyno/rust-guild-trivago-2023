/* tslint:disable */
/* eslint-disable */
/**
* Given a JsValue that wraps an asynchronous function, invoke it,
* await the obtained Promise value, and return the result.
*
* ```text
* (arg: unknown) => Promise<unknown>
*     |
*     |  ┌ ─ ─ ─ ─ ─ ─    JsFunction::from()   ┌ ─ ─ ─ ─ ─ ─     
*     └ ─    JsValue  │─ ─ - - - - - - - - ──▶   JsFunction │
*        └ ─ ─ ─ ─ ─ ─                         └ ─ ─ ─ ─ ─ ─
*                                                     │
*                                      callN(JsValue::null(), ...args)?
*                                                     |
*                                                     ▼         The Promise
*        ┌ ─ ─ ─ ─ ─ ─     JsPromise::from()   ┌ ─ ─ ─ ─ ─ ─   starts running
*          JsPromise  │◀── ─ ─ - - - - - - - -    JsValue   │ ─ ─ ─ ─
*        └ ─ ─ ─ ─ ─ ─                         └ ─ ─ ─ ─ ─ ─         │
*              |
*       JsFuture::from()                                             │
*              |                                    ┌ ─ ─ ─ ─ ─ ─    
*              ▼                                      Result<    |   │
*        ┌ ─ ─ ─ ─ ─ ─  .await / JsFuture::poll()   |   JsValue,
*           JsFuture  │─ ─ - - - - - - - - - - - ──▶    JsValue, |   |
*        └ ─ ─ ─ ─ ─ ─                              | >            ◀─
*                                                    ─ ─ ─ ─ ─ ─ ┘                                                       
* ```
* @param {any} async_fn
* @param {any} arg1
* @returns {Promise<any>}
*/
export function call_async_fn(async_fn: any, arg1: any): Promise<any>;
