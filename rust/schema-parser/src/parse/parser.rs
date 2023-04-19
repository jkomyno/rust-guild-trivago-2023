use nom::IResult;

pub trait Parser {
  /// Parses a schema, potentially leaving some input unparsed.
  fn parse(input: &str) -> IResult<&str, Self>
  where
    Self: Sized;
}

pub trait ParserFinal {
  /// Parses a schema. Fails if the entire input is not consumed.
  fn parse_all(input: &str) -> Result<Self, String>
  where
    Self: Sized + Parser;
}

macro_rules! parse_alt_enum {
  ($s:expr) => {
    value($s.into(), tag($s))
  };
}

pub(crate) use parse_alt_enum;
