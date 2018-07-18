import addMarkdownProps from '../utils/markdownProps';
import { Mode } from './index';

const vegaLiteSchema20 = require('./schemas/vega-lite/v2.0.json');
const vegaLiteSchema = require('vega-lite/build/vega-lite-schema.json');
const vegaSchema = require('vega/docs/vega-schema.json');

addMarkdownProps(vegaSchema);
addMarkdownProps(vegaLiteSchema);

export const DEFAULT_SCHEMAS = {
  [Mode.Vega]: [
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v3.json',
    },
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v3.0.json',
    },
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v3.1.json',
    },
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v4.json',
    },
    {
      schema: vegaSchema,
      uri: 'https://vega.github.io/schema/vega/v4.0.json',
    },
  ],
  [Mode.VegaLite]: [
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.json',
    },
    {
      schema: vegaLiteSchema20,
      uri: 'https://vega.github.io/schema/vega-lite/v2.0.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.1.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.2.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.3.json',
    },
    {
      schema: vegaLiteSchema,
      uri: 'https://vega.github.io/schema/vega-lite/v2.4.json',
    },
  ],
};
