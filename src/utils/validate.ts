import {satisfies} from 'semver';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import schemaParser from 'vega-schema-url-parser';

export function validateVega(spec: any, logger: any) {
  // Basic validation - can be extended with more specific Vega validation
  if (!spec || typeof spec !== 'object') {
    throw new Error('Invalid Vega specification');
  }
}

export function validateVegaLite(spec: any, logger: any) {
  // Basic validation - can be extended with more specific Vega-Lite validation
  if (!spec || typeof spec !== 'object') {
    throw new Error('Invalid Vega-Lite specification');
  }
}

export function validateSchema(spec: any, mode: 'vega' | 'vega-lite', logger: any) {
  if (spec.$schema) {
    try {
      const parsed = schemaParser(spec.$schema);
      if (mode === 'vega') {
        if (!satisfies(vega.version, `^${parsed.version.slice(1)}`)) {
          logger.warn(`The specification expects Vega ${parsed.version} but the editor uses v${vega.version}.`);
        }
      } else if (mode === 'vega-lite') {
        if (!satisfies(vegaLite.version, `^${parsed.version.slice(1)}`)) {
          logger.warn(
            `The specification expects Vega-Lite ${parsed.version} but the editor uses v${vegaLite.version}.`,
          );
        }
      }
    } catch (e) {
      throw new Error('Could not parse $schema url.');
    }
  }
}
