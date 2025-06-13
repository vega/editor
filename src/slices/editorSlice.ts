import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import type * as Monaco from 'monaco-editor';
import {Spec} from 'vega';
import {TopLevelSpec as VlSpec} from 'vega-lite';
import {Mode} from '../constants/index.js';
import {validateVega, validateVegaLite} from '../utils/validate.js';
import {LocalLogger} from '../utils/logger.js';
import {parse as parseJSONC, visit as visitJSONC, printParseErrorCode as printJSONCParseErrorCode} from 'jsonc-parser';
import schemaParser from 'vega-schema-url-parser';
import {satisfies} from 'semver';
import * as vega from 'vega';

interface EditorState {
  editorString: string;
  vegaSpec: Spec | null;
  vegaLiteSpec: VlSpec | null;
  normalizedVegaLiteSpec: any;
  mode: Mode;
  parse: boolean;
  manualParse: boolean;

  editorRef: Monaco.editor.IStandaloneCodeEditor | null;
  compiledEditorRef: Monaco.editor.IStandaloneCodeEditor | null;
  editorFocus: string;

  selectedExample: string | null;
  gist: string | null;

  error: {message: string} | null;
  errors: string[];
  warns: string[];
  infos: string[];
  debugs: string[];

  view: any;
  signals: any;
  decorations: any[];

  lastPosition: number;

  export: boolean;

  baseURL: string | null;
}

const initialState: EditorState = {
  editorString: '',
  vegaSpec: null,
  vegaLiteSpec: null,
  normalizedVegaLiteSpec: null,
  mode: Mode.VegaLite,
  parse: false,
  manualParse: false,
  editorRef: null,
  compiledEditorRef: null,
  editorFocus: 'spec-editor',
  selectedExample: null,
  gist: null,
  error: null,
  errors: [],
  warns: [],
  infos: [],
  debugs: [],
  view: null,
  signals: {},
  decorations: [],
  lastPosition: 0,
  export: false,
  baseURL: null,
};

function throwJSONCParseError(error, _offset, _length, startLine, startCharacter): SyntaxError {
  const errorMessage = `${printJSONCParseErrorCode(error)} at Ln ${startLine + 1}, Col ${startCharacter + 1}`;
  throw SyntaxError(errorMessage);
}

function parseJSONCOrThrow(spec: string) {
  visitJSONC(spec, {onError: throwJSONCParseError}, {disallowComments: false, allowTrailingComma: true});
  return parseJSONC(spec);
}

export const parseVegaSpec = createAsyncThunk('editor/parseVegaSpec', async (spec: string, {getState}) => {
  const state = getState() as any;
  const currLogger = new LocalLogger();
  currLogger.level(state.ui?.logLevel || vega.Warn);

  try {
    const parsedSpec = parseJSONCOrThrow(spec);

    if (parsedSpec.$schema) {
      try {
        const parsed = schemaParser(parsedSpec.$schema);
        if (!satisfies(vega.version, `^${parsed.version.slice(1)}`))
          currLogger.warn(`The specification expects Vega ${parsed.version} but the editor uses v${vega.version}.`);
      } catch (e) {
        throw new Error('Could not parse $schema url.');
      }
    }

    validateVega(parsedSpec, currLogger);

    return {
      spec: parsedSpec,
      logs: {
        warns: currLogger.warns,
        infos: currLogger.infos,
        debugs: currLogger.debugs,
        errors: [],
      },
    };
  } catch (e: any) {
    throw new Error(e.message);
  }
});

export const parseVegaLiteSpec = createAsyncThunk('editor/parseVegaLiteSpec', async (spec: string, {getState}) => {
  const state = getState() as any;
  const currLogger = new LocalLogger();
  currLogger.level(state.ui?.logLevel || vega.Warn);

  try {
    const parsedSpec = parseJSONCOrThrow(spec);

    if (parsedSpec.$schema) {
      try {
        const parsed = schemaParser(parsedSpec.$schema);
        if (!satisfies(vega.version, `^${parsed.version.slice(1)}`))
          currLogger.warn(
            `The specification expects Vega-Lite ${parsed.version} but the editor uses v${vega.version}.`,
          );
      } catch (e) {
        throw new Error('Could not parse $schema url.');
      }
    }

    validateVegaLite(parsedSpec, currLogger);

    return {
      spec: parsedSpec,
      logs: {
        warns: currLogger.warns,
        infos: currLogger.infos,
        debugs: currLogger.debugs,
        errors: [],
      },
    };
  } catch (e: any) {
    throw new Error(e.message);
  }
});

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    updateEditorString: (state, action: PayloadAction<string>) => {
      state.editorString = action.payload;
      state.error = null;
      if (!state.manualParse) {
        state.parse = true;
      }
    },

    updateVegaSpec: (state, action: PayloadAction<string>) => {
      state.editorString = action.payload;
      state.mode = Mode.Vega;
      state.selectedExample = null;
      state.gist = null;
      state.error = null;
      state.parse = true;
    },

    updateVegaLiteSpec: (state, action: PayloadAction<string>) => {
      state.editorString = action.payload;
      state.mode = Mode.VegaLite;
      state.selectedExample = null;
      state.gist = null;
      state.error = null;
      state.parse = true;
    },

    setMode: (state, action: PayloadAction<Mode>) => {
      state.mode = action.payload;
      state.parse = true;
    },

    setModeOnly: (state, action: PayloadAction<Mode>) => {
      state.mode = action.payload;
    },

    setVegaExample: (state, action: PayloadAction<{example: string; spec: string}>) => {
      state.selectedExample = action.payload.example;
      state.editorString = action.payload.spec;
      state.mode = Mode.Vega;
      state.gist = null;
      state.error = null;
      state.parse = true;
    },

    setVegaLiteExample: (state, action: PayloadAction<{example: string; spec: string}>) => {
      state.selectedExample = action.payload.example;
      state.editorString = action.payload.spec;
      state.mode = Mode.VegaLite;
      state.gist = null;
      state.error = null;
      state.parse = true;
    },

    setGistVegaSpec: (state, action: PayloadAction<{gist: string; spec: string}>) => {
      state.gist = action.payload.gist;
      state.editorString = action.payload.spec;
      state.mode = Mode.Vega;
      state.selectedExample = null;
      state.error = null;
      state.parse = true;
    },

    setGistVegaLiteSpec: (state, action: PayloadAction<{gist: string; spec: string}>) => {
      state.gist = action.payload.gist;
      state.editorString = action.payload.spec;
      state.mode = Mode.VegaLite;
      state.selectedExample = null;
      state.error = null;
      state.parse = true;
    },

    setEditorReference: (state, action: PayloadAction<Monaco.editor.IStandaloneCodeEditor>) => {
      state.editorRef = action.payload;
    },

    setCompiledEditorReference: (state, action: PayloadAction<Monaco.editor.IStandaloneCodeEditor>) => {
      state.compiledEditorRef = action.payload;
    },

    setEditorFocus: (state, action: PayloadAction<string>) => {
      state.editorFocus = action.payload;
    },

    toggleAutoParse: (state) => {
      state.manualParse = !state.manualParse;
    },

    parseSpec: (state, action: PayloadAction<boolean>) => {
      state.parse = action.payload;
    },

    setView: (state, action: PayloadAction<any>) => {
      state.view = action.payload;
    },

    setSignals: (state, action: PayloadAction<any>) => {
      state.signals = action.payload;
    },

    addSignal: (state, action: PayloadAction<any>) => {
      state.signals = {...state.signals, ...action.payload};
    },

    setDecorations: (state, action: PayloadAction<any[]>) => {
      state.decorations = action.payload;
    },

    setScrollPosition: (state, action: PayloadAction<number>) => {
      state.lastPosition = action.payload;
    },

    exportVega: (state, action: PayloadAction<boolean>) => {
      state.export = action.payload;
    },

    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseURL = action.payload;
    },

    logError: (state, action: PayloadAction<string>) => {
      state.errors.push(action.payload);
    },

    addError: (state, action: PayloadAction<string>) => {
      state.errors.push(action.payload);
    },

    addWarning: (state, action: PayloadAction<string>) => {
      state.warns.push(action.payload);
    },

    addInfo: (state, action: PayloadAction<string>) => {
      state.infos.push(action.payload);
    },

    addDebug: (state, action: PayloadAction<string>) => {
      state.debugs.push(action.payload);
    },

    clearLogs: (state) => {
      state.errors = [];
      state.warns = [];
      state.infos = [];
      state.debugs = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(parseVegaSpec.pending, (state) => {
        state.error = null;
      })
      .addCase(parseVegaSpec.fulfilled, (state, action) => {
        state.vegaSpec = action.payload.spec;
        state.warns = action.payload.logs.warns;
        state.infos = action.payload.logs.infos;
        state.debugs = action.payload.logs.debugs;
        state.errors = action.payload.logs.errors;
        state.error = null;
      })
      .addCase(parseVegaSpec.rejected, (state, action) => {
        state.error = {message: action.error.message || 'Parse error'};
        state.vegaSpec = null;
      })

      .addCase(parseVegaLiteSpec.pending, (state) => {
        state.error = null;
      })
      .addCase(parseVegaLiteSpec.fulfilled, (state, action) => {
        state.vegaLiteSpec = action.payload.spec;
        state.warns = action.payload.logs.warns;
        state.infos = action.payload.logs.infos;
        state.debugs = action.payload.logs.debugs;
        state.errors = action.payload.logs.errors;
        state.error = null;
      })
      .addCase(parseVegaLiteSpec.rejected, (state, action) => {
        state.error = {message: action.error.message || 'Parse error'};
        state.vegaLiteSpec = null;
      });
  },
});

export const {
  updateEditorString,
  updateVegaSpec,
  updateVegaLiteSpec,
  setMode,
  setModeOnly,
  setVegaExample,
  setVegaLiteExample,
  setGistVegaSpec,
  setGistVegaLiteSpec,
  setEditorReference,
  setCompiledEditorReference,
  setEditorFocus,
  toggleAutoParse,
  parseSpec,
  setView,
  setSignals,
  addSignal,
  setDecorations,
  setScrollPosition,
  exportVega,
  setBaseUrl,
  logError,
  addError,
  addWarning,
  addInfo,
  addDebug,
  clearLogs,
} = editorSlice.actions;
