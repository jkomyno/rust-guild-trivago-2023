use crate::{
  ast::{
    datasource::Datasource,
    schema::{SchemaAST, SchemaASTBlock},
  },
  parseutil::ws,
};
use nom::branch::alt;
use nom::IResult;
use nom::{combinator::map, multi::many0};

use super::parser::{Parser, ParserFinal};

impl SchemaASTBlock {
  /// Parses a schema block, e.g.,
  /// r#"datasource db {
  ///   provider = "postgres"
  ///   url      = "postgres://user:pass@host:port/dbname"
  /// }"#.
  fn parse(input: &str) -> IResult<&str, Self> {
    alt((map(Datasource::parse, SchemaASTBlock::Datasource),))(input)
  }
}

impl Parser for SchemaAST {
  /// Parses a schema, e.g.,
  /// r#"
  /// db {
  ///   provider = "postgres"
  ///   url      = "postgres://user:pass@host:port/dbname"
  /// }
  ///
  /// model User {
  ///   id   String @id @map("user_id")
  ///   name String @map("user_name")
  /// }
  /// "#.
  fn parse(input: &str) -> IResult<&str, Self> {
    ws(many0(SchemaASTBlock::parse))(input).map(|(rest, schema_ast_blocks)| {
      let mut datasources = vec![];
      for schema_ast_block in schema_ast_blocks {
        match schema_ast_block {
          SchemaASTBlock::Datasource(datasource) => datasources.push(datasource),
        }
      }
      (rest, SchemaAST { datasources })
    })
  }
}

impl ParserFinal for SchemaAST {
  fn parse_all(input: &str) -> Result<Self, String> {
    let parse_result = Self::parse(input);

    match parse_result {
      Ok((remaining_input, schema_ast)) if remaining_input.is_empty() => Ok(schema_ast),
      Ok(_) => Err("Invalid syntax detected".to_string()),
      Err(e) => Err(e.to_string()),
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::ast::datasource_db::{DatasourceDb, Provider, Url};

  #[test]
  fn parse_empty_schema() {
    let schema = r#"

    "#;

    let ast = SchemaAST::parse_all(schema).unwrap();

    assert_eq!(ast, SchemaAST { datasources: vec![] });
  }

  #[test]
  fn parse_incomplete_schema() {
    let schema = r#"
      datasource db {
        provider = "postgres"
        url = env()
      }
    "#;

    let schema_err = SchemaAST::parse_all(schema).unwrap_err();

    assert_eq!(schema_err, "Invalid syntax detected");
  }

  #[test]
  fn parse_datasource_only_schema() {
    let schema = r#"
      datasource db {
        provider = "postgres"
        url = env("DATABASE_URL")
      }
    "#;

    let ast = SchemaAST::parse_all(schema).unwrap();

    assert_eq!(
      ast,
      SchemaAST {
        datasources: vec!(Datasource::Db(DatasourceDb {
          provider: Provider::Postgres,
          url: Url::Env(String::from("DATABASE_URL"),),
          shadow_database_url: None,
        },),),
      }
    );
  }

  #[test]
  fn parse_schema() {
    let schema = r#"
      datasource db {
        provider = "postgres"
        
        url = env("DATABASE_URL")
      }
    "#;

    let ast = SchemaAST::parse_all(schema).unwrap();

    assert_eq!(
      ast,
      SchemaAST {
        datasources: vec!(Datasource::Db(DatasourceDb {
          provider: Provider::Postgres,
          url: Url::Env(String::from("DATABASE_URL"),),
          shadow_database_url: None,
        },),),
      }
    );
  }
}
