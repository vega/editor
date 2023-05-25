import stringify from 'json-stringify-pretty-compact';
import {parse as parseJSONC} from 'jsonc-parser';
import type * as Monaco from 'monaco-editor';
import {mergeDeep} from 'vega-lite';
import addMarkdownProps from './markdownProps';

import vegaLiteSchema from 'vega-lite/build/vega-lite-schema.json';
import vegaSchema from 'vega/build/vega-schema.json';

import {loader} from '@monaco-editor/react';

addMarkdownProps(vegaSchema);
addMarkdownProps(vegaLiteSchema);

const schemas = [
  {
    schema: vegaSchema,
    uri: 'https://vega.github.io/schema/vega/v5.json',
  },
  {
    schema: vegaLiteSchema,
    uri: 'https://vega.github.io/schema/vega-lite/v5.json',
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
    uri: 'https://vega.github.io/schema/vega-lite/v5.json#Config',
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
  loader.init().then((monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      comments: 'warning',
      trailingCommas: 'warning',
      enableSchemaRequest: true,
      schemas,
      validate: true,
    });

    monaco.languages.json.jsonDefaults.setModeConfiguration({
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

    monaco.languages.registerDocumentFormattingEditProvider('json', {
      provideDocumentFormattingEdits(
        model: Monaco.editor.ITextModel,
        options: Monaco.languages.FormattingOptions,
        token: Monaco.CancellationToken
      ): Monaco.languages.TextEdit[] {
        return [
          {
            range: model.getFullModelRange(),
            text: stringify(parseJSONC(model.getValue())),
          },
        ];
      },
    });
  });
}
