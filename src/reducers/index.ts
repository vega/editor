import * as vl from 'vega-lite';

import {
  Action,
  EXPORT_VEGA,
  FORMAT_SPEC,
  LOG_ERROR,
  PARSE_SPEC,
  SET_BASEURL,
  SET_DATASETS,
  SET_GIST_VEGA_LITE_SPEC,
  SET_GIST_VEGA_SPEC,
  SET_MODE,
  SET_RENDERER,
  SET_VEGA_EXAMPLE,
  SET_VEGA_LITE_EXAMPLE,
  SetGistVegaLiteSpec,
  SetGistVegaSpec,
  SetVegaExample,
  SetVegaLiteExample,
  SHOW_COMPILED_VEGA_SPEC,
  SHOW_ERROR_PANE,
  SHOW_TOOLTIP,
  TOGGLE_AUTO_PARSE,
  UPDATE_EDITOR_STRING,
  UPDATE_VEGA_LITE_SPEC,
  UPDATE_VEGA_SPEC,
  UpdateVegaLiteSpec,
  UpdateVegaSpec,
} from '../actions/editor';
import { DEFAULT_STATE, Mode } from '../constants';
import { State } from '../constants/default-state';
import { LocalLogger } from '../utils/logger';
import { validateVega, validateVegaLite } from '../utils/validate';

function parseVega(state: State, action: SetVegaExample | UpdateVegaSpec | SetGistVegaSpec, extend = {}) {
  const currLogger = new LocalLogger();

  try {
    const spec = JSON.parse(action.spec);

    validateVega(spec, currLogger);

    extend = {
      ...extend,
      vegaSpec: spec,
    };
  } catch (e) {
    console.warn(e);

    extend = {
      ...extend,
      error: e.message,
    };
  }
  return {
    ...state,

    editorString: action.spec,
    error: null,
    gist: null,
    mode: Mode.Vega,
    selectedExample: null,
    warningsLogger: currLogger,

    // extend with other changes
    ...extend,
  };
}

function parseVegaLite(
  state: State,
  action: SetVegaLiteExample | UpdateVegaLiteSpec | SetGistVegaLiteSpec,
  extend = {}
) {
  const currLogger = new LocalLogger();

  try {
    const spec = JSON.parse(action.spec);

    validateVegaLite(spec, currLogger);

    const vegaSpec = action.spec !== '{}' ? vl.compile(spec, { logger: currLogger }).spec : {};

    extend = {
      ...extend,
      vegaLiteSpec: spec,
      vegaSpec,
    };
  } catch (e) {
    console.warn(e);

    extend = {
      ...extend,
      error: e.message,
    };
  }
  return {
    ...state,

    editorString: action.spec,
    error: null,
    gist: null,
    mode: Mode.VegaLite,
    selectedExample: null,
    warningsLogger: currLogger,

    // extend with other changes
    ...extend,
  };
}

export default (state: State = DEFAULT_STATE, action: Action): State => {
  switch (action.type) {
    case SET_MODE:
      return {
        ...state,
        baseURL: null,
        compiledVegaSpec: false,
        dataSets: null,
        editorString: '{}',
        export: false,
        format: false,
        gist: null,
        mode: action.mode,
        parse: false,
        selectedExample: null,
        tooltip: true,
        vegaLiteSpec: {},
        vegaSpec: {},
        warningsLogger: new LocalLogger(),
      };
    case PARSE_SPEC:
      return {
        ...state,
        parse: action.parse,
      };
    case SET_VEGA_EXAMPLE: {
      return parseVega(state, action, {
        selectedExample: action.example,
      });
    }
    case UPDATE_VEGA_SPEC: {
      return parseVega(state, action);
    }
    case SET_GIST_VEGA_SPEC: {
      return parseVega(state, action, {
        gist: action.gist,
      });
    }
    case SET_VEGA_LITE_EXAMPLE: {
      return parseVegaLite(state, action, {
        selectedExample: action.example,
      });
    }
    case UPDATE_VEGA_LITE_SPEC: {
      return parseVegaLite(state, action);
    }
    case SET_GIST_VEGA_LITE_SPEC: {
      return parseVegaLite(state, action, {
        gist: action.gist,
      });
    }
    case TOGGLE_AUTO_PARSE:
      return {
        ...state,
        autoParse: !state.autoParse,
        parse: !state.autoParse,
      };
    case SHOW_COMPILED_VEGA_SPEC:
      return {
        ...state,
        compiledVegaSpec: !state.compiledVegaSpec,
      };
    case SHOW_ERROR_PANE:
      return {
        ...state,
        errorPane: !state.errorPane,
      };
    case LOG_ERROR:
      return {
        ...state,
        error: action.error,
      };
    case UPDATE_EDITOR_STRING:
      return {
        ...state,
        editorString: action.editorString,
      };
    case SHOW_TOOLTIP:
      return {
        ...state,
        tooltip: !state.tooltip,
      };
    case EXPORT_VEGA:
      return {
        ...state,
        export: action.export,
      };
    case SET_RENDERER:
      return {
        ...state,
        renderer: action.renderer,
      };
    case SET_BASEURL:
      return {
        ...state,
        baseURL: action.baseURL,
      };
    case FORMAT_SPEC:
      return {
        ...state,
        format: action.format,
      };
    case SET_DATASETS:
      return {
        ...state,
        dataSets: action.dataSets,
      };
    default:
      return state;
  }
};
