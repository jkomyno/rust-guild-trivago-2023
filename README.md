# WebAssembly in Production: From Rust to TypeScript and back

> Accompanying slides for the talk I presented remotely at Rust Guild 2023 (hosted @ Trivago offices in Düsseldorf, Germany).

<p>
  <a href="https://github.com/jkomyno/rust-guild-trivago-2023/actions/workflows/ci.yml">
    <img alt="Github Actions" src="https://github.com/jkomyno/rust-guild-trivago-2023/actions/workflows/ci.yml/badge.svg?branch=main" target="_blank" />
  </a>

  <a href="https://github.com/jkomyno/rust-guild-trivago-2023/blob/main/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
  
</p>

Slides for this talk are also available [here](http://jkomyno-rust-guild-trivago-2023.vercel.app/).

## Abstract

This talk will teach you how to run performance critical native code in a JavaScript runtime with Rust, without the burden of distributing platform-dependent artifacts. You will learn how to smoothly integrate WebAssembly (Wasm) into your Node.js application, while also automatically generating idiomatic TypeScript definitions. And while Wasm looks like a clear winner thanks to its portability, it's not a silver bullet. That's why we'll also solve the typical Wasm data serialization issues, addressing limitations and escape hatches. Essential topics such as dealing with errors and panics in Wasm are also covered. Finally, we will present some lesser-known tricks to let WebAssembly interact with the outside world without resorting to WASI - by defining the I/O logic in Node.js and executing it within the Wasm context.

## Inspirations

This repository and talk wouldn't have been possible without the following projects:

- [`js_sys`](https://github.com/rustwasm/wasm-bindgen/tree/main/crates/js-sys)
- [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen)
- [`wasm-bindgen-futures`](https://github.com/rustwasm/wasm-bindgen/tree/main/crates/futures)
- [`serde`](https://github.com/serde-rs/serde)
- [`serde_json`](https://github.com/serde-rs/json)
- [`serde-wasm-bindgen`](https://github.com/cloudflare/serde-wasm-bindgen)
- [`tsify`](https://github.com/madonoharu/tsify)

Please consider starring, supporting, and contributing to them.

## Get Started

### Requirements

- [`nodejs@18.12.1`](https://nodejs.org/en/download/) or superior*
- [`pnpm@7.20.0`](https://pnpm.io/installation) or superior*

(*) These are the versions used to develop this repository. Older versions might work as well, but they haven't been tested.

### Install Dependencies

- Install dependencies:
  ```sh
  pnpm i
  ```

In [`./rust`](./rust):

- Install the Rust toolchain via [Rustup](https://rustup.rs/):
  ```sh
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- Add suppport for the `wasm32-unknown-unknown` compilation target for Rust:
  ```sh
  rustup target add wasm32-unknown-unknown
  ```

- Install `wasm-bindgen`:
  ```sh
  cargo install -f wasm-bindgen-cli@0.2.84
  ```
  
  (the specific version is important, as `wasm-bindgen-cli` doesn't yet follow semantic versioning. This version needs to match the version of the `wasm-bindgen` dependency in the `Cargo.toml` files of the Rust crates)

### Build & Test

With Docker:

  - Build and run the local Docker image:

    ```sh
    ./build.sh
    ```

Without Docker:

  - Run Rust unit tests and build the WebAssembly artifacts:

    ```sh
    pnpm build:wasm
    ```

  - Run Node.js unit tests:

    ```sh
    pnpm test:ci
    ```

## Example Playgrounds

### `playground-wasm-bindgen`

The local [`playground-wasm-bindgen`](./rust/playground-wasm-bindgen/src/lib.rs) crate demonstrates how to use `wasm-bindgen` to export Rust functions and types (in the form of structs / enums) to TypeScript.

The [`functions::unsupported`](./rust/playground-wasm-bindgen/src/functions/unsupported.rs) module (respectively, the [`types::unsupported`](./rust/playground-wasm-bindgen/src/types/unsupported.rs) module) contains a set of functions (respectively, types) that are not supported by `wasm-bindgen` by default, with comments showing the compilation errors that are thrown when trying to export them.

For instance, trying to compile the [following code](https://github.com/jkomyno/rust-guild-trivago-2023/blob/main/rust/playground-wasm-bindgen/src/functions/unsupported.rs#L4-L30)

```rust
/// Given a Vec<Vec<i32>> vector, return its length.
#[wasm_bindgen]
pub fn get_nested_array_length(x: Vec<Vec<i32>>) -> usize {
  x.iter().flatten().count()
}
```

would result in a compilation error like the following:

```console
error[E0277]: the trait bound `Vec<i32>: JsObject` is not satisfied
  --> wasm-bindgen-playground/src/functions/unsupported.rs:27:1
   |
27 | #[wasm_bindgen]
   | ^^^^^^^^^^^^^^^ the trait `JsObject` is not implemented for `Vec<i32>`
   |
   = help: the following other types implement trait `FromWasmAbi`:
             Box<[JsValue]>
             Box<[T]>
             Box<[f32]>
             Box<[f64]>
             Box<[i16]>
             Box<[i32]>
             Box<[i64]>
             Box<[i8]>
           and 6 others
   = note: required for `Box<[Vec<i32>]>` to implement `FromWasmAbi`
   = note: this error originates in the attribute macro `wasm_bindgen`
```

- You can find the TypeScript tests for the `playground-wasm-bindgen` crate in [`./nodejs/demo/__tests__playground-wasm-bindgen.test.ts`](./nodejs/demo/__tests__/playground-wasm-bindgen.test.ts) and [`./nodejs/demo/__tests__/playground-wasm-bindgen.test-d.ts`](./nodejs/demo/__tests__/playground-wasm-bindgen.test-d.ts)
- You can find the TypeScript bindings for the `playground-wasm-bindgen` crate in [`./nodejs/demo/wasm/playground_wasm_bindgen.d.ts`](./nodejs/demo/wasm/playground_wasm_bindgen.d.ts)

### `playground-serde-wasm-bindgen`

The local [`playground-serde-wasm-bindgen`](./rust/playground-serde-wasm-bindgen/src/lib.rs) crate demonstrates how to use `wasm-bindgen` combined with `serde` and `serde-wasm-bindgen` to export Rust functions and types to TypeScript. This allows you to deal with complex types both in Wasm arguments and return types, at the cost of loosing strongly typed TypeScript bindings.

- You can find the TypeScript tests for the `playground-serde-wasm-bindgen` crate in [`./nodejs/demo/__tests__/playground-serde-wasm-bindgen.test.ts`](./nodejs/demo/__tests__/playground-serde-wasm-bindgen.test.ts)
- You can find the TypeScript bindings for the `playground-serde-wasm-bindgen` crate in [`./nodejs/demo/wasm/playground_serde_wasm_bindgen.d.ts`](./nodejs/demo/wasm/playground_serde_wasm_bindgen.d.ts)

### `playground-wasm-tsify`

The local [`playground-wasm-tsify`](./rust/playground-wasm-tsify/src/lib.rs) crate demonstrates how to use `wasm-bindgen` combined with `serde` and `tsify` to export Rust functions and types to TypeScript. This allows you to deal with complex types both in Wasm arguments and return types, as well as obtaining strongly typed and idiomatic TypeScript bindings.

- You can find the TypeScript tests for the `playground-wasm-tsify` crate in [`./nodejs/demo/__tests__/playground-wasm-tsify.test.ts`](./nodejs/demo/__tests__/playground-wasm-tsify.test.ts)
- You can find the TypeScript bindings for the `playground-wasm-tsify` crate in [`./nodejs/demo/wasm/tsify.d.ts`](./nodejs/demo/wasm/playground_wasm_tsify.d.ts)

## Demo: Cross-language Serialization

**Note**: for this demo, open a terminal into the [`./nodejs/demo`](./nodejs/demo) folder.

As an example of a non-trivial WebAssembly library that uses `wasm-bindgen` and `tsify` to export type-safe TypeScript bindings of Rust functions to Node.js, we will consider a parser and a validator for a subset of the [prisma](https://prisma.io) schema language.

Here's an example of a valid such schema:

```
datasource db {
  provider = "postgres"
  url = env("DATABASE_URL")
  shadowDatabaseUrl = "postgres://optional-url"
}
```

where:
- the `datasource` block describes a database configuration
  - the `provider` field specifies the database provider from a close set of options ("postgres", "cockroachdb", "mysql", "mariadb", "sqlserver", "sqlite", "mongodb")
  - the `url` field specifies the database URL, which can be either a static string or can be read from an environment variable
  - the `shadowDatabaseUrl` field is optional and specifies a shadow database URL, which can also be either a static string or can be read from an environment variable

A schema is considered valid if the following conditions apply at the same time (non-exhaustive list):
- it contains exactly one `datasource` block
- the `provider` attribute refers to a known database provider
- the `url` and `shadowDatabaseUrl` attributes refer to either either static strings or environment variables (which are not necessarily defined)
- the non-optional schema attributes are present and are valid
- no extraneous blocks, attributes, or tokens are present in the schema

Using the [./rust/schema-parser](./rust/schema-parser) crate and the WebAssembly bindings defined in [./rust/schema-parser-wasm](./rust/schema-parser-wasm), we can parse this schema into the following Rust data structure:

```rust
SchemaAST {
  datasources: vec!(
    Datasource::Db(
      DatasourceDb {
        provider: Provider::Postgres,
        url: Url::Env(
          String::from("DATABASE_URL"),
        ),
        shadow_database_url: Some(
          Url::Static(
            String::from("postgres://optional-url"),
          ),
        ),
      },
    ),
  ),
}
```

In TypeScript, we expect the AST above to be translated as

```typescript
{
  datasources: [
    {
      _tag: 'db',
      value: {
        provider: 'postgres',
        url: {
          _tag: 'env',
          value: 'DATABASE_URL',
        },
        // shadowDatabaseUrl can be null 
        shadowDatabaseUrl: {
          _tag: 'static',
          value: 'postgres://optional-url',
        },
      },
    },
  ]
}
```

according to the following type declarations:

```typescript
export type Provider = "postgres" | "cockroachdb" | "mysql" | "mariadb" | "sqlserver" | "sqlite" | "mongodb"

export type Url
  = { _tag: 'static', value: string } // => Static(String) in Rust
  | { _tag: 'env', value: string }    // => Env(String) in Rust

export type DatasourceDb = {
  provider: Provider
  url: Url
  shadowDatabaseUrl: Url | null
}

export type Datasource
  = { _tag: 'db', value: DatasourceDb }

export type SchemaAST = {
  datasources: Datasource[]
}
```

### Validation

We have 3 predefined example schemas:

1. One that is valid

  ```prisma
  datasource db {
    provider = "sqlite"
    url = "file:./dev.db"
  }
  ```

  - We can validate this case with

    ```bash
    npx ts-node ./src/validate-ast.ts success
    ```

  - We expect the following output

    ```bash
    Validating AST...

    AST validated successfully!
    ```

2. One that results in a known error (as it has multiple `datasource` blocks and an invalid `url` for the `postgres` provider)

  ```prisma
  datasource db {
    provider = "cockroachdb"
    url = "postgres://jkomyno:prisma@localhost:5432"
  }

  datasource db {
    provider = "postgres"
    url = "mysql://jkomyno:prisma@localhost:5432"
  }
  ```

  - We can validate this case with

    ```bash
    npx ts-node ./src/validate-ast.ts error
    ```

  - We expect the following output

    ```bash
    Validating AST...

    [node:error] {
      errors: [
        `The provider "cockroachdb" is not yet supported. Supported providers are: '"sqlite"', '"postgres"'.`,
        '"postgres" URLs must start with postgres://, received mysql://jkomyno:prisma@localhost:5432',
        'You defined more than one datasource. This is not supported yet.'
      ]
    }
    ```

3. One that crashes with a panic (because `url` read from environment variables are not supported)

```prisma
  datasource db {
    provider = "cockroachdb"
    url = env("DATABASE_URL")
  }
```

  - We can validate this case with

    ```bash
    npx ts-node ./src/validate-ast.ts panic
    ```

  - We expect the following output

    ```bash
    Validating AST...

    [node:panic] RuntimeError: unreachable
        at wasm://wasm/0009a75e:wasm-function[674]:0x2265d
        at wasm://wasm/0009a75e:wasm-function[460]:0x216ba
        at wasm://wasm/0009a75e:wasm-function[237]:0x1b3e6
        at wasm://wasm/0009a75e:wasm-function[284]:0x1d738
        at wasm://wasm/0009a75e:wasm-function[445]:0x21403
        at wasm://wasm/0009a75e:wasm-function[374]:0x200f2
        at wasm://wasm/0009a75e:wasm-function[426]:0x21015
        at wasm://wasm/0009a75e:wasm-function[91]:0xf7e5
        at wasm://wasm/0009a75e:wasm-function[98]:0x1064d
        at wasm://wasm/0009a75e:wasm-function[269]:0x1cc7b
    ```

    As we can see, the panic is bubbled up to Node.js, which prints the panic message and stacktrace (although that's not particularly informative, as it always returns `unreachable`).

## Demo: Error handling

**Note**: for this demo, open a terminal into the [`./nodejs/demo`](./nodejs/demo) folder.

Rust model failures via `Result<T, E>` enum values, where `T` is the type of the successful result and `E` is the type of the error. However, fatal panics can also occur, for instance when unwrapping one such `Result` or when accessing a vector outside its boundaries. Panics in WebAssembly always result into runtime JavaScript `Error`s.
One drawback of WebAssembly is that no panic message can be retrieved at runtime (by reading the `.message` property of a panic error bubbled up in Node.js): attempting do so would result in always reading the same static string: `unreachable`. However, thanks to the `wasm_bindgen` crate, `std::sync::Once` and `std::panic::set_hook`, one can intercept panics in Rust and register their message into a global Node.js object, which can then be read by Node.js itself.

We have 2 panic scenarios:

1. One with an unhelpful panic message (`unreachable`):
  
  - We can trigger it with

    ```bash
    npx ts-node ./src/panic.ts default
    ```

  - We expect the following output

    ```bash
    Triggering panic (default, no panic hook)...

    [node:panic:default] { message: 'unreachable' }
    RuntimeError: unreachable
        at __rust_start_panic (wasm://wasm/000619c2:wasm-function[254]:0x134a5)
        at rust_panic (wasm://wasm/000619c2:wasm-function[156]:0x12af0)
        at std::panicking::rust_panic_with_hook::hc53aea0352e77326 (wasm://wasm/000619c2:wasm-function[32]:0xd5f9)
        at std::panicking::begin_panic_handler::{{closure}}::ha183a8279614f03a (wasm://wasm/000619c2:wasm-function[43]:0xe629)
        at std::sys_common::backtrace::__rust_end_short_backtrace::hc33870f333461503 (wasm://wasm/000619c2:wasm-function[143]:0x12770)
        at rust_begin_unwind (wasm://wasm/000619c2:wasm-function[77]:0x10528)
        at core::panicking::panic_fmt::hf4a9df75710ece83 (wasm://wasm/000619c2:wasm-function[130]:0x12339)
        at core::panicking::panic_display::he56cfad23d6f4743 (wasm://wasm/000619c2:wasm-function[102]:0x1160c)
        at trigger_panic (wasm://wasm/000619c2:wasm-function[59]:0xf69b)
        at playground_wasm_panic::trigger_panic_wasm::h3e8cd27e574791f2 (wasm://wasm/000619c2:wasm-function[209]:0x1329e)
    ```

2. One using custom panic hook to register the panic message into global Node.js object instantiated accordingly and explicitly referenced by code via `wasm_bindgen`:
  
  - We can trigger it with

    ```bash
    npx ts-node ./src/panic.ts manager
    ```

  - We expect the following output

    ```bash
    Triggering panic (registry, with panic hook)...

    setMessage was called with message: panicked at 'This is a test panic', playground-wasm-panic/src/lib.rs:46:5
    [node:panic:registry] {
      message: "RuntimeError: panicked at 'This is a test panic', playground-wasm-panic/src/lib.rs:46:5"
    }
    RuntimeError: panicked at 'This is a test panic', playground-wasm-panic/src/lib.rs:46:5
        at __rust_start_panic (wasm://wasm/000619c2:wasm-function[254]:0x134a5)
        at rust_panic (wasm://wasm/000619c2:wasm-function[156]:0x12af0)
        at std::panicking::rust_panic_with_hook::hc53aea0352e77326 (wasm://wasm/000619c2:wasm-function[32]:0xd5f9)
        at std::panicking::begin_panic_handler::{{closure}}::ha183a8279614f03a (wasm://wasm/000619c2:wasm-function[43]:0xe629)
        at std::sys_common::backtrace::__rust_end_short_backtrace::hc33870f333461503 (wasm://wasm/000619c2:wasm-function[143]:0x12770)
        at rust_begin_unwind (wasm://wasm/000619c2:wasm-function[77]:0x10528)
        at core::panicking::panic_fmt::hf4a9df75710ece83 (wasm://wasm/000619c2:wasm-function[130]:0x12339)
        at core::panicking::panic_display::he56cfad23d6f4743 (wasm://wasm/000619c2:wasm-function[102]:0x1160c)
        at trigger_panic (wasm://wasm/000619c2:wasm-function[59]:0xf69b)
        at playground_wasm_panic::trigger_panic_wasm_with_registry::hb30a6cb1483ec445 (wasm://wasm/000619c2:wasm-function[205]:0x13254)
    ```

## Demo: I/O in WebAssembly

**Note**: for this demo, open a terminal into the [`./nodejs/demo`](./nodejs/demo) folder.

One can define Node.js functions that perform I/O operations (normally forbidden in WebAssembly) and forward them to WebAssembly by using the `js_sys` crate. Moreover, one can use the `wasm_bindgen_futures` crate to await JavaScript functions that return a Promise.

We can ask WebAssembly to read an example [./nodejs/demo/io.txt](./nodejs/demo/io.txt) file and print its content to the console via:

```bash
npx ts-node ./src/io.ts
```

We expect the following output:

```bash
[rust] Calling async fn from Rust...
[rust] Async fn is running
[rust] Awaiting promise...
[rust] Promise resolved with: JsValue("You are reading I/O from WebAssembly!
$ € 𐐷 𤭢
")

[node] File content: You are reading I/O from WebAssembly!
$ € 𐐷 𤭢
```

## 👤 Author

**Alberto Schiabel**

* Twitter: [@jkomyno](https://twitter.com/jkomyno)
* Github: [@jkomyno](https://github.com/jkomyno)

Please consider supporting my work by following me on Twitter and starring my projects on GitHub.
I mostly post about TypeScript, Rust, and WebAssembly. Thanks!

## 📝 License

Built with ❤️ by [Alberto Schiabel](https://github.com/jkomyno).
This project is [MIT](https://github.com/jkomyno/rust-guild-trivago-2023/blob/main/LICENSE) licensed.
