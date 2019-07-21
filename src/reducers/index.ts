import * as vl from 'vega-lite';
import { Config } from 'vega-lite/src/config';
import {
  Action,
  CLEAR_CONFIG,
  EXPORT_VEGA,
  LOG_ERROR,
  PARSE_SPEC,
  SET_BASEURL,
  SET_COMPILED_VEGA_PANE_SIZE,
  SET_CONFIG,
  SET_CONFIG_EDITOR_STRING,
  SET_DEBUG_PANE_SIZE,
  SET_EDITOR_REFERENCE,
  SET_GIST_VEGA_LITE_SPEC,
  SET_GIST_VEGA_SPEC,
  SET_MODE,
  SET_MODE_ONLY,
  SET_RENDERER,
  SET_SCROLL_POSITION,
  SET_VEGA_EXAMPLE,
  SET_VEGA_LITE_EXAMPLE,
  SET_VIEW,
  SetConfig,
  SetGistVegaLiteSpec,
  SetGistVegaSpec,
  SetVegaExample,
  SetVegaLiteExample,
  SHOW_LOGS,
  TOGGLE_AUTO_PARSE,
  TOGGLE_COMPILED_VEGA_SPEC,
  TOGGLE_DEBUG_PANE,
  TOGGLE_NAV_BAR,
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
import { SET_SIDEPANE_ITEM, SET_THEME_NAME } from './../actions/editor';

function errorLine(code: string, error: string) {
  const pattern = /(position\s)(\d+)/;
  let charPos: any = error.match(pattern);

  if (charPos !== null) {
    charPos = charPos[2];
    if (!isNaN(charPos)) {
      let line = 1;
      let cursorPos = 0;

      while (cursorPos < charPos && code.indexOf('\n', cursorPos) < charPos && code.indexOf('\n', cursorPos) > -1) {
        const newlinePos = code.indexOf('\n', cursorPos);
        line = line + 1;
        cursorPos = newlinePos + 1;
      }

      return `${error} and line ${line}`;
    }
  } else {
    return error;
  }
}

function parseVega(
  state: State,
  action: SetVegaExample | UpdateVegaSpec | SetGistVegaSpec,
  extend: Partial<State> = {}
) {
  const currLogger = new LocalLogger();

  try {
    const spec = JSON.parse(action.spec);

    validateVega(spec, currLogger);

    extend = {
      ...extend,
      vegaSpec: spec,
    };
  } catch (e) {
    const errorMessage = errorLine(action.spec, e.message);
    console.warn(e);

    extend = {
      ...extend,
      error: new Error(errorMessage),
    };
  }
  const logger = { ...currLogger };
  return {
    ...state,

    editorString: action.spec,
    error: null,
    gist: null,
    mode: Mode.Vega,
    selectedExample: null,
    warningsCount: (logger as any).warns.length,
    warningsLogger: currLogger,

    // extend with other changes
    ...extend,
  };
}

function parseVegaLite(
  state: State,
  action: SetVegaLiteExample | UpdateVegaLiteSpec | SetGistVegaLiteSpec | SetConfig,
  extend: Partial<State> = {}
) {
  const currLogger = new LocalLogger();

  let spec: string;
  let configEditorString: string;
  try {
    switch (action.type) {
      case SET_CONFIG:
        spec = state.editorString;
        configEditorString = action.configEditorString;
        break;
      case SET_VEGA_LITE_EXAMPLE:
      case SET_GIST_VEGA_LITE_SPEC:
      case UPDATE_VEGA_LITE_SPEC:
        spec = action.spec;
        configEditorString = state.configEditorString;
    }

    const vegaLiteSpec: vl.TopLevelSpec = JSON.parse(spec);
    const config: Config = JSON.parse(configEditorString);

    const options = {
      config,
      logger: currLogger,
    };
    validateVegaLite(vegaLiteSpec, currLogger);

    const vegaSpec = spec !== '{}' ? vl.compile(vegaLiteSpec, options).spec : {};

    extend = {
      ...extend,
      vegaLiteSpec,
      vegaSpec,
    };
  } catch (e) {
    const errorMessage = errorLine(spec, e.message);
    console.warn(e);

    extend = {
      ...extend,
      error: new Error(errorMessage),
    };
  }
  const logger = { ...currLogger };
  return {
    ...state,

    editorString: spec,
    error: null,
    gist: null,
    mode: Mode.VegaLite,
    selectedExample: null,
    warningsCount: (logger as any).warns.length,
    warningsLogger: currLogger,

    // extend with other changes
    ...extend,
  };
}

function parseConfig(state: State, action: SetConfig, extend: Partial<State> = {}) {
  let config: Config;
  try {
    config = JSON.parse(action.configEditorString);
  } catch (e) {
    const errorMessage = errorLine(action.configEditorString, e.message);
    console.warn(e);

    extend = {
      ...extend,
      error: new Error(errorMessage),
    };
  }
  return {
    ...state,
    config,
    error: null,

    // extend
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
        editorString: '{}',
        export: false,
        gist: null,
        mode: action.mode,
        parse: false,
        selectedExample: null,
        vegaLiteSpec: null,
        vegaSpec: {},
        view: null,
        warningsCount: 0,
        warningsLogger: new LocalLogger(),
      };
    case SET_MODE_ONLY:
      return {
        ...state,
        mode: action.mode,
      };
    case SET_SCROLL_POSITION:
      return {
        ...state,
        lastPosition: action.position,
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
        manualParse: !state.manualParse,
        parse: state.manualParse,
      };
    case TOGGLE_COMPILED_VEGA_SPEC:
      return {
        ...state,
        compiledVegaSpec: !state.compiledVegaSpec,
      };
    case TOGGLE_DEBUG_PANE:
      return {
        ...state,
        debugPane: !state.debugPane,
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
    case SET_VIEW:
      return {
        ...state,
        view: action.view,
      };
    case SET_DEBUG_PANE_SIZE:
      return {
        ...state,
        debugPaneSize: action.debugPaneSize,
      };
    case SHOW_LOGS:
      return {
        ...state,
        logs: action.logs,
      };
    case SET_COMPILED_VEGA_PANE_SIZE:
      return {
        ...state,
        compiledVegaPaneSize: action.compiledVegaPaneSize,
      };
    case TOGGLE_NAV_BAR:
      return {
        ...state,
        navItem: action.navItem,
      };
    case SET_CONFIG:
      return state.mode === Mode.VegaLite
        ? parseVegaLite(state, action, {
            configEditorString: action.configEditorString,
          })
        : parseConfig(state, action);
    case SET_THEME_NAME:
      return {
        ...state,
        themeName: action.themeName,
      };
    case SET_SIDEPANE_ITEM:
      return {
        ...state,
        sidePaneItem: action.sidePaneItem,
      };
    case SET_CONFIG_EDITOR_STRING:
      return {
        ...state,
        configEditorString: action.configEditorString,
      };
    case SET_EDITOR_REFERENCE:
      return {
        ...state,
        editorRef: action.editorRef,
      };
    case CLEAR_CONFIG:
      return {
        ...state,
        config: {},
        configEditorString: '{}',
        themeName: 'custom',
      };
    default:
      return state;
  }
};
