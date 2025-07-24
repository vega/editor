import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {LocalLogger} from './logger.js';
import vegaLiteSchema from 'vega-lite/vega-lite-schema.json';
import vegaSchema from 'vega/vega-schema.json';
import schema from 'ajv/lib/refs/json-schema-draft-06.json';

const ajv = new Ajv({
  strict: false, // needed for Vega schema
});

addFormats(ajv);
ajv.addMetaSchema(schema);
ajv.addFormat('color-hex', () => true);

const vegaValidator = ajv.compile(vegaSchema);
const vegaLiteValidator = ajv.compile(vegaLiteSchema);

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
