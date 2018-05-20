import Ajv from 'ajv';

const ajv = new Ajv({
  jsonPointers: true,
  allErrors: false,
  schemaId: 'auto',
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

const vegaValidator = ajv.compile(require('vega/docs/vega-schema.json'));
const vegaLiteValidator = ajv.compile(require('vega-lite/build/vega-lite-schema.json'));

export function validateVegaLite(spec, logger) {
  const valid = vegaLiteValidator(spec);
  if (!valid) {
    for (const error of vegaLiteValidator.errors) {
      logger.warn(`Validation: ${error.dataPath} ${error.message}`);
    }
  }
}

export function validateVega(spec, logger) {
  const valid = vegaValidator(spec);
  if (!valid) {
    for (const error of vegaValidator.errors) {
      logger.warn(`Validation: ${error.dataPath} ${error.message}`);
    }
  }
}
