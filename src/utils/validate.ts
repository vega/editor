import Ajv from 'ajv';

const ajv = new Ajv({
  allErrors: false,
  jsonPointers: true,
  schemaId: 'auto',
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
ajv.addFormat('color-hex', () => true);

const vegaValidator = ajv.compile(require('vega/build/vega-schema.json'));
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
