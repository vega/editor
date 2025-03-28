import stringify from 'json-stringify-pretty-compact';
import {satisfies} from 'semver';
import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import {Config} from 'vega-lite';
import {TopLevelSpec} from 'vega-lite';
import schemaParser from 'vega-schema-url-parser';
import {
  Action,
  CLEAR_CONFIG,
  DEBUG,
  ERROR,
  EXPORT_VEGA,
  EXTRACT_CONFIG_SPEC,
  INFO,
  LOG_ERROR,
  PARSE_SPEC,
  RECEIVE_CURRENT_USER,
  SetConfig,
  setConfig,
  SetGistVegaLiteSpec,
  SetGistVegaSpec,
  SetVegaExample,
  SetVegaLiteExample,
  SET_BACKGROUND_COLOR,
  SET_BASEURL,
  SET_COMPILEDPANE_ITEM,
  SET_COMPILED_EDITOR_REFERENCE,
  SET_COMPILED_VEGA_PANE_SIZE,
  SET_CONFIG,
  SET_CONFIG_EDITOR_STRING,
  SET_DEBUG_PANE_SIZE,
  SET_DECORATION,
  SET_EDITOR_FOCUS,
  SET_EDITOR_REFERENCE,
  SET_GIST_VEGA_LITE_SPEC,
  SET_GIST_VEGA_SPEC,
  SET_MODE,
  SET_MODE_ONLY,
  SET_RENDERER,
  SET_SCROLL_POSITION,
  SET_SIGNALS,
  SET_VEGA_EXAMPLE,
  SET_VEGA_LITE_EXAMPLE,
  SET_VIEW,
  SET_EXPRESSION_INTERPRETER,
  SHOW_LOGS,
  TOGGLE_AUTO_PARSE,
  TOGGLE_COMPILED_VEGA_SPEC,
  TOGGLE_DEBUG_PANE,
  TOGGLE_GIST_PRIVACY,
  TOGGLE_NAV_BAR,
  UpdateVegaLiteSpec,
  UpdateVegaSpec,
  UPDATE_EDITOR_STRING,
  UPDATE_VEGA_LITE_SPEC,
  UPDATE_VEGA_SPEC,
  WARN,
} from '../actions/editor.js';
import {DEFAULT_STATE, GistPrivacy, Mode} from '../constants/index.js';
import {State} from '../constants/default-state.js';
import {dataflowReducer} from '../features/dataflow/index.js';
import {validateVega, validateVegaLite} from '../utils/validate.js';
import {
  MERGE_CONFIG_SPEC,
  SET_HOVER,
  SET_LOG_LEVEL,
  SET_SETTINGS,
  SET_SIDEPANE_ITEM,
  SET_THEME_NAME,
  SET_TOOLTIP,
} from './../actions/editor.js';
import {LocalLogger} from './../utils/logger.js';
import {parse as parseJSONC, visit as visitJSONC, printParseErrorCode as printJSONCParseErrorCode} from 'jsonc-parser';

function throwJSONCParseError(error, _offset, _length, startLine, startCharacter): SyntaxError {
  const errorMessage = `${printJSONCParseErrorCode(error)} at Ln ${startLine + 1}, Col ${startCharacter + 1}`;
  throw SyntaxError(errorMessage);
}

function parseJSONCOrThrow(spec: string) {
  visitJSONC(spec, {onError: throwJSONCParseError}, {disallowComments: false, allowTrailingComma: true});
  return parseJSONC(spec);
}

function mergeConfigIntoSpec(state: State) {
  if (state.configEditorString === '{}') {
    return {
      ...state,
      parse: true,
    };
  }

  let spec: TopLevelSpec;
  let config: Config;
  try {
    spec = parseJSONC(state.editorString);
    config = parseJSONC(state.configEditorString);
    if (spec.config) {
      spec.config = vega.mergeConfig(config, spec.config);
    } else {
      spec.config = config;
    }
    return {
      ...state,
      config: {},
      configEditorString: '{}',
      editorString: stringify(spec),
      parse: true,
      themeName: 'custom',
    };
  } catch (e) {
    console.warn(e);
    return {
      ...state,
      parse: true,
    };
  }
}

function extractConfig(state: State) {
  let spec: TopLevelSpec;
  let config: Config;
  try {
    spec = parseJSONC(state.editorString);
    config = parseJSONC(state.configEditorString);
    if (spec.config) {
      config = vega.mergeConfig(config, spec.config);
      delete spec.config;
    }
    return {
      ...state,
      configEditorString: stringify(config),
      editorString: stringify(spec),
      parse: true,
    };
  } catch (e) {
    console.warn(e);
    return {
      ...state,
      parse: true,
    };
  }
}

function parseVega(
  state: State,
  action: SetVegaExample | UpdateVegaSpec | SetGistVegaSpec,
  extend: Partial<State> = {},
) {
  const currLogger = new LocalLogger();
  currLogger.level(state.logLevel);

  try {
    const spec = parseJSONCOrThrow(action.spec);

    if (spec.$schema) {
      try {
        const parsed = schemaParser(spec.$schema);
        if (!satisfies(vega.version, `^${parsed.version.slice(1)}`))
          currLogger.warn(`The specification expects Vega ${parsed.version} but the editor uses v${vega.version}.`);
      } catch (e) {
        throw new Error('Could not parse $schema url.');
      }
    }

    validateVega(spec, currLogger);

    extend = {
      ...extend,
      vegaSpec: spec,
    };
  } catch (e) {
    console.warn(e);

    extend = {
      ...extend,
      error: {message: e.message},
    };
  }

  return {
    ...state,

    editorString: action.spec,
    error: null,
    gist: null,
    mode: Mode.Vega,
    selectedExample: null,
    errors: [],
    warns: currLogger.warns,
    infos: currLogger.infos,
    debugs: currLogger.debugs,

    // extend with other changes
    ...extend,
  };
}

function parseVegaLite(
  state: State,
  action: SetVegaLiteExample | UpdateVegaLiteSpec | SetGistVegaLiteSpec | SetConfig,
  extend: Partial<State> = {},
) {
  const currLogger = new LocalLogger();
  currLogger.level(state.logLevel);

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

    const vegaLiteSpec: vegaLite.TopLevelSpec = parseJSONCOrThrow(spec);
    const config: Config = parseJSONCOrThrow(configEditorString);

    const options = {
      config,
      logger: currLogger,
    };

    if (vegaLiteSpec.$schema) {
      try {
        const parsed = schemaParser(vegaLiteSpec.$schema);
        if (!satisfies(vegaLite.version, `^${parsed.version.slice(1)}`))
          currLogger.warn(
            `The specification expects Vega-Lite ${parsed.version} but the editor uses v${vegaLite.version}.`,
          );
      } catch (e) {
        throw new Error('Could not parse $schema url.');
      }
    }

    validateVegaLite(vegaLiteSpec, currLogger);

    const compileResult = spec !== '{}' ? vegaLite.compile(vegaLiteSpec, options) : {spec: {}, normalized: {}};
    const vegaSpec = compileResult.spec;
    const normalizedVegaLiteSpec = compileResult.normalized;

    extend = {
      ...extend,
      vegaLiteSpec,
      normalizedVegaLiteSpec,
      vegaSpec,
    };
  } catch (e) {
    console.warn(e);

    extend = {
      ...extend,
      error: {message: e.message},
    };
  }

  return {
    ...state,

    editorString: spec,
    error: null,
    gist: null,
    mode: Mode.VegaLite,
    selectedExample: null,
    errors: [],
    warns: currLogger.warns,
    infos: currLogger.infos,
    debugs: currLogger.debugs,

    // extend with other changes
    ...extend,
  };
}

function parseConfig(state: State, action: SetConfig, extend: Partial<State> = {}) {
  let config: Config;
  try {
    config = parseJSONCOrThrow(action.configEditorString);
  } catch (e) {
    console.warn(e);

    extend = {
      ...extend,
      error: {message: e.message},
    };
  }

  return {
    ...state,
    config,
    error: null,
    errors: [],
    warns: [],
    debugs: [],
    infos: [],

    // extend with other changes
    ...extend,
  };
}

export default (state: State = DEFAULT_STATE, action: Action): State => {
  // Copy all changes to state from dataflow reducer to state
  state = {...state, ...dataflowReducer(state, action)};
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
        error: null,
        errors: [],
        warns: [],
        infos: [],
        debugs: [],
        expressionInterpreter: false,
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
      if (action.config !== undefined) {
        const newState = parseConfig(state, setConfig(action.config));
        return parseVega(newState, action);
      } else {
        return parseVega(state, action);
      }
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
      if (action.config !== undefined) {
        return parseVegaLite(state, action, {configEditorString: action.config});
      } else {
        return parseVegaLite(state, action);
      }
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
    case SET_SETTINGS:
      return {
        ...state,
        settings: action.settings,
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
    case SET_COMPILEDPANE_ITEM:
      return {
        ...state,
        compiledPaneItem: action.compiledPaneItem,
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
    case SET_LOG_LEVEL:
      return {
        ...state,
        logLevel: action.logLevel,
      };
    case SET_HOVER:
      return {
        ...state,
        hoverEnable: action.hoverEnable,
      };
    case SET_TOOLTIP:
      return {
        ...state,
        tooltipEnable: action.tooltipEnable,
      };
    case CLEAR_CONFIG:
      return {
        ...state,
        config: {},
        configEditorString: '{}',
        themeName: 'custom',
      };
    case MERGE_CONFIG_SPEC:
      return mergeConfigIntoSpec(state);
    case EXTRACT_CONFIG_SPEC:
      return extractConfig(state);

    case SET_SIGNALS:
      return {
        ...state,
        signals: action.signals,
      };
    case SET_DECORATION:
      return {
        ...state,
        decorations: action.decoration,
      };
    case SET_COMPILED_EDITOR_REFERENCE:
      return {
        ...state,
        compiledEditorRef: action.editorRef,
      };
    case SET_EDITOR_FOCUS:
      return {
        ...state,
        editorFocus: action.editorFocus,
      };

    case SET_EXPRESSION_INTERPRETER:
      return {
        ...state,
        expressionInterpreter: action.expressionInterpreter,
      };

    case RECEIVE_CURRENT_USER:
      return {
        ...state,
        handle: action.handle,
        isAuthenticated: action.isAuthenticated,
        name: action.name,
        profilePicUrl: action.profilePicUrl,
      };
    case TOGGLE_GIST_PRIVACY:
      return {
        ...state,
        private: state.private === GistPrivacy.PUBLIC ? GistPrivacy.ALL : GistPrivacy.PUBLIC,
      };
    case SET_BACKGROUND_COLOR:
      return {
        ...state,
        backgroundColor: action.color,
      };
    case ERROR:
      return {
        ...state,
        errors: [...state.errors, action.error],
      };
    case WARN:
      return {
        ...state,
        warns: [...state.warns, action.warn],
      };
    case INFO:
      return {
        ...state,
        infos: [...state.infos, action.info],
      };
    case DEBUG:
      return {
        ...state,
        debugs: [...state.debugs, action.debug],
      };
    default:
      return state;
  }
};
