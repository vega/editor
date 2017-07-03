import * as vl from 'vega-lite';

import { UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC, PARSE_SPEC, TOGGLE_AUTO_PARSE, CYCLE_RENDERER, SET_VEGA_EXAMPLE, SET_VEGA_LITE_EXAMPLE,
  SHOW_COMPILED_VEGA_SPEC, SET_GIST_VEGA_SPEC, SET_GIST_VEGA_LITE_SPEC, SET_MODE, SHOW_ERROR_PANE, LOG_ERROR } from '../../actions/editor';
import { MODES, RENDERERS } from '../../constants';

const JSON3 = require('../../../lib/json3-compactstringify');

class LocalLogger {
  warns = [];
  infos = [];
  debugs = [];

  level() {
    return this;
  }

  warn(...args) {
    this.warns.push(...args);
    return this;
  }

  info(...args) {
    this.infos.push(...args);
    return this;
  }

  debug(...args) {
    this.debugs.push(...args);
    return this;
  }
}

// singleton new LocalLogger
var newLogger = new LocalLogger();

export default (state = {
  editorString: '{}',
  vegaSpec: {},
  vegaLiteSpec: null,
  selectedExample: null,
  mode: MODES.Vega,
  renderer: RENDERERS.Canvas,
  autoParse: true,
  parse: false,
  compiledVegaSpec: false,
  gist: null,
  error: null,
  errorPane: false,
  warningsLogger: newLogger
}, action) => {
  let spec, vegaSpec;
  switch (action.type) {
    case SET_MODE:
      return Object.assign({}, state, {
        mode: action.mode,
        vegaSpec: {},
        vegaLiteSpec: {},
        selectedExample: null,
        editorString: '{}',
        compiledVegaSpec: false,
        gist: null,
        parse: false,
        warningsLogger: newLogger
      });
    case PARSE_SPEC:
      return Object.assign({}, state, {
        parse: action.parse
      });
    case UPDATE_VEGA_SPEC:
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60),
          warningsLogger: newLogger
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        error: null,
        warningsLogger: newLogger
      });
    case SET_VEGA_EXAMPLE:
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          warningsLogger: newLogger,
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        selectedExample: action.example,
        error: null,
        warningsLogger: newLogger,
      });
    case SET_VEGA_LITE_EXAMPLE:
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = spec;
        if (action.spec !== '{}') {
          vegaSpec = vl.compile(spec).spec;
        }
      } catch (e) {
        console.warn(e);
        return Object.assign({}, state, {
          warningsLogger: newLogger,
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        selectedExample: action.example,
        error: null,
        warningsLogger: newLogger
      });
    case UPDATE_VEGA_LITE_SPEC:
      let currLogger = new LocalLogger();
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec, currLogger).spec;
      } catch (e) {
        console.warn(e);
        return Object.assign({}, state, {
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60),
          warningsLogger: currLogger
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        error: null,
        warningsLogger: currLogger
      });
    case SET_GIST_VEGA_SPEC:
      try {
        spec = JSON.parse(action.spec);
      } catch(e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          warningsLogger: newLogger,
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        gist: action.gist,
        error: null,
        warningsLogger: newLogger
      });
    case SET_GIST_VEGA_LITE_SPEC:
      try {
        currLogger = new LocalLogger();
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec, currLogger).spec;
      } catch(e) {
        console.warn(e);
        return Object.assign({}, state, {
          warningsLogger: currLogger,
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        gist: action.gist,
        error: null,
        warningsLogger: currLogger
      });
    case TOGGLE_AUTO_PARSE:
      return Object.assign({}, state, {
        autoParse: !state.autoParse,
        parse: !state.autoParse
      });
    case CYCLE_RENDERER:
      const rendererVals = Object.values(RENDERERS);
      const currentRenderer = rendererVals.indexOf(state.renderer);
      const nextRenderer = rendererVals[(currentRenderer + 1) % rendererVals.length];
      return Object.assign({}, state, {
        renderer: nextRenderer
      });
    case SHOW_COMPILED_VEGA_SPEC:
      return Object.assign({}, state, {
        compiledVegaSpec: !state.compiledVegaSpec,
      });
    case SHOW_ERROR_PANE: 
      return Object.assign({}, state, {
        errorPane: !state.errorPane
      });
    case LOG_ERROR:
      return Object.assign({}, state, {
        error: action.error
      });
    default:
      return state;
  }
}
