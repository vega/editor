import * as vl from 'vega-lite';

import {UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC, PARSE_SPEC, TOGGLE_AUTO_PARSE, CYCLE_RENDERER, SET_VEGA_EXAMPLE, SET_VEGA_LITE_EXAMPLE,
  SHOW_COMPILED_VEGA_SPEC, SET_GIST_VEGA_SPEC, SET_GIST_VEGA_LITE_SPEC, SET_MODE, SHOW_ERROR_PANE, LOG_ERROR,
  UPDATE_EDITOR_STRING, SHOW_TOOLTIP} from '../actions/editor';

import {MODES, RENDERERS, DEFAULT_STATE} from '../constants';
import {validateVegaLite, validateVega} from '../utils/validate';
import {LocalLogger} from '../utils/logger'


function parseVega(state, action, extend = {}) {
  const currLogger = new LocalLogger();

  try {
    const spec = JSON.parse(action.spec);

    validateVega(spec, currLogger);

    extend = {
      ...extend,
      vegaSpec: spec
    };
  } catch (e) {
    console.warn(e);

    extend = {
      ...extend,
      error: e.message
    };
  }
  return {
    ...state,

    // reset things
    selectedExample: null,
    gist: null,
    error: null,

    // set mode and spec
    mode: MODES.Vega,
    editorString: action.spec,
    warningsLogger: currLogger,

    // extend with other changes
    ...extend
  };
}

function parseVegaLite(state, action, extend = {}) {
  const currLogger = new LocalLogger();

  try {
    const spec = JSON.parse(action.spec);

    validateVegaLite(spec, currLogger);

    const vegaSpec = action.spec !== '{}' ? vl.compile(spec, {logger: currLogger}).spec : {};

    extend = {
      ...extend,
      vegaLiteSpec: spec,
      vegaSpec: vegaSpec
    };
  } catch (e) {
    console.warn(e);

    extend = {
      ...extend,
      error: e.message
    };
  }
  return {
    ...state,

    // reset things
    selectedExample: null,
    gist: null,
    error: null,

    // set mode and spec
    mode: MODES.VegaLite,
    editorString: action.spec,
    warningsLogger: currLogger,

    // extend with other changes
    ...extend
  };
}

export default (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case SET_MODE:
      return {
        ...state,
        mode: action.mode,
        vegaSpec: {},
        vegaLiteSpec: {},
        selectedExample: null,
        editorString: '{}',
        compiledVegaSpec: false,
        gist: null,
        parse: false,
        warningsLogger: new LocalLogger(),
        tooltip: true
      }
    case PARSE_SPEC:
      return {
        ...state,
        parse: action.parse
      };
    case SET_VEGA_EXAMPLE: {
      return parseVega(state, action, {
        selectedExample: action.example
      });
    }
    case UPDATE_VEGA_SPEC: {
      return parseVega(state, action);
    }
    case SET_GIST_VEGA_SPEC: {
      return parseVega(state, action, {
        gist: action.gist
      });
    }
    case SET_VEGA_LITE_EXAMPLE: {
      return parseVegaLite(state, action, {
        selectedExample: action.example
      });
    }
    case UPDATE_VEGA_LITE_SPEC: {
      return parseVegaLite(state, action);
    }
    case SET_GIST_VEGA_LITE_SPEC: {
      return parseVegaLite(state, action, {
        gist: action.gist
      });
    }
    case TOGGLE_AUTO_PARSE:
      return {
        ...state,
        autoParse: !state.autoParse,
        parse: !state.autoParse
      };
    case CYCLE_RENDERER: {
      const rendererVals = Object.values(RENDERERS);
      const currentRenderer = rendererVals.indexOf(state.renderer);
      const nextRenderer = rendererVals[(currentRenderer + 1) % rendererVals.length];

      return {
        ...state,
        renderer: nextRenderer
      };
    }
    case SHOW_COMPILED_VEGA_SPEC:
      return {
        ...state,
        compiledVegaSpec: !state.compiledVegaSpec,
      };
    case SHOW_ERROR_PANE:
      return {
        ...state,
        errorPane: !state.errorPane
      };
    case LOG_ERROR:
      return {
        ...state,
        error: action.error
      };
    case UPDATE_EDITOR_STRING:
      return {
        ...state,
        editorString: action.editorString
      };
    case SHOW_TOOLTIP:
      return {
        ...state,
        tooltip: !state.tooltip
      };
    default:
      return state;
  }
}
