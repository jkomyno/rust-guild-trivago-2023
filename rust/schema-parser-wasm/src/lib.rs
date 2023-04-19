use schema_parser::ast::schema::SchemaAST;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = exampleSchema)]
pub fn example_schema_wasm() -> Result<SchemaAST, JsError> {
  let schema = schema_parser::example_schema();
  Ok(schema)
}

#[wasm_bindgen(js_name = parseSchema)]
pub fn parse_schema_wasm(input: String) -> Result<SchemaAST, JsError> {
  let ast_result: Result<SchemaAST, String> = schema_parser::parse_schema(input);
  ast_result.map_err(|err| JsError::new(&err))
}

#[wasm_bindgen(js_name = validateAST)]
pub fn validate_schema_wasm(ast: SchemaAST) -> Result<(), JsError> {
  schema_parser::validate_ast(&ast).map_err(|err| {
    let err_string: String = err.into();
    JsError::new(&err_string)
  })
}

#[wasm_bindgen(js_name = validateASTErrAsString)]
pub fn validate_schema_wasm_err_as_string(ast: SchemaAST) -> Result<(), String> {
  schema_parser::validate_ast(&ast).map_err(|err| err.into())
}
