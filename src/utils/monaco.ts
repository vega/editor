import stringify from 'json-stringify-pretty-compact';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {mergeDeep} from 'vega-lite/build/src/util';
import addMarkdownProps from './markdownProps';

const vegaLiteSchema = require('vega-lite/build/vega-lite-schema.json');
const vegaSchema = require('vega/build/vega-schema.json');

addMarkdownProps(vegaSchema);
addMarkdownProps(vegaLiteSchema);

const schemas = [
  {
    schema: vegaSchema,
    uri: 'https://vega.github.io/schema/vega/v5.json',
  },
  {
    schema: vegaLiteSchema,
    uri: 'https://vega.github.io/schema/vega-lite/v4.json',
  },
  {
    schema: mergeDeep({}, vegaLiteSchema, {
      $ref: '#/definitions/Config',
      definitions: {
        Config: {
          properties: {
            $schema: {
              type: 'string',
            },
          },
        },
      },
    }),
    uri: 'https://vega.github.io/schema/vega-lite/v4.json#Config',
  },
  {
    schema: {
      $schema: 'http://json-schema.org/draft-06/schema#',
      type: 'object',
    },
    uri: 'https://vega.github.io/schema/vega/v5.json#Config',
  },
];

export default function setupMonaco() {
  Monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    allowComments: false,
    enableSchemaRequest: true,
    schemas,
    validate: true,
  });

  Monaco.languages.json.jsonDefaults.setModeConfiguration({
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    tokens: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
  });

  Monaco.languages.registerDocumentFormattingEditProvider('json', {
    provideDocumentFormattingEdits(
      model: Monaco.editor.ITextModel,
      options: Monaco.languages.FormattingOptions,
      token: Monaco.CancellationToken
    ): Monaco.languages.TextEdit[] {
      return [
        {
          range: model.getFullModelRange(),
          text: stringify(JSON.parse(model.getValue())),
        },
      ];
    },
  });
}
