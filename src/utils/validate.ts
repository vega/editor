import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {LocalLogger} from './logger';

const ajv = new Ajv({
  strict: false, // needed for Vega schema
});

addFormats(ajv);
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
ajv.addFormat('color-hex', () => true);

const vegaValidator = ajv.compile(require('vega/build/vega-schema.json'));
const vegaLiteValidator = ajv.compile(require('vega-lite/build/vega-lite-schema.json'));

export function validateVegaLite(spec, logger: LocalLogger) {
  const valid = vegaLiteValidator(spec);
  if (!valid) {
    for (const error of vegaLiteValidator.errors) {
      logger.warn(`Validation: ${error.instancePath ?? '/'} ${error.message} of ${error.schemaPath}`);
    }
  }
}

export function validateVega(spec, logger: LocalLogger) {
  const valid = vegaValidator(spec);
  if (!valid) {
    for (const error of vegaValidator.errors) {
      logger.warn(`Validation: ${error.instancePath ?? '/'} ${error.message} of ${error.schemaPath}`);
    }
  }
}
