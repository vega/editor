import {parse as parseJSONC, visit as visitJSONC, printParseErrorCode as printJSONCParseErrorCode} from 'jsonc-parser';

function throwJSONCParseError(
  error: any,
  _offset: number,
  _length: number,
  startLine: number,
  startCharacter: number,
): SyntaxError {
  const errorMessage = `${printJSONCParseErrorCode(error)} at Ln ${startLine + 1}, Col ${startCharacter + 1}`;
  throw new SyntaxError(errorMessage);
}

export function parseJSONCOrThrow(spec: string) {
  visitJSONC(spec, {onError: throwJSONCParseError}, {disallowComments: false, allowTrailingComma: true});
  return parseJSONC(spec);
}

export {parseJSONC};
