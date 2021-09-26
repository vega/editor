import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/parser-babel';

/**
 * Prettify a JS expression, by creating a statement out of it, then removing the variable decleration and trailing semi-colon.
 *
 * Pass in a label length to adjust how much is wrapped on the first line.
 **/
export function prettifyExpression(expression: string, labelLength = 1): string {
  const label = 'a'.repeat(labelLength);
  const prefix = `${label} = `;
  return prettier
    .format(`${prefix}${expression}`, {parser: 'babel', printWidth: 60, plugins: [parserBabel]})
    .slice(prefix.length, -2);
}
