import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/parser-babel';

/**
 * Prettify a JS expression, by creating a statement out of it, then removing the variable decleration and trailing semi-colon.
 **/

export function prettifyExpression(expression: string): string {
  return prettier.format(`i = ${expression}`, {parser: 'babel', printWidth: 60, plugins: [parserBabel]}).slice(4, -2);
}

/**
 * Prettify a JSON value as Javascript literal.
 */
export function prettifyJSON(value: unknown): string {
  return prettifyExpression(JSON.stringify(value));
}
