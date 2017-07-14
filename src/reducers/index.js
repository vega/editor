import * as vl from 'vega-lite';

import {UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC, PARSE_SPEC, TOGGLE_AUTO_PARSE, CYCLE_RENDERER, SET_VEGA_EXAMPLE, SET_VEGA_LITE_EXAMPLE,
  SHOW_COMPILED_VEGA_SPEC, SET_GIST_VEGA_SPEC, SET_GIST_VEGA_LITE_SPEC, SET_MODE, SHOW_ERROR_PANE, LOG_ERROR,
  UPDATE_EDITOR_STRING, SHOW_TOOLTIP} from '../actions/editor';
  
import {MODES, RENDERERS, DEFAULT_STATE} from '../constants';
import {validateVegaLite, validateVega} from '../utils/validate';
import {LocalLogger} from '../utils/logger'


export default (state = DEFAULT_STATE, action) => {
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
        warningsLogger: new LocalLogger(),
        tooltip: true
      });
    case PARSE_SPEC:
      return Object.assign({}, state, {
        parse: action.parse
      });
    case UPDATE_VEGA_SPEC: {
      const currLogger = new LocalLogger();
      try {
        spec = JSON.parse(action.spec);
        validateVega(spec, currLogger);
      } catch (e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          error: e.message,
          editorString: action.spec,
          warningsLogger: currLogger,
          selectedExample: null,
          mode: MODES.Vega
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        error: null,
        warningsLogger: currLogger,
        selectedExample: null
      });
    }
    case SET_VEGA_EXAMPLE:
      spec = JSON.parse(action.spec);
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        selectedExample: action.example,
        error: null,
        warningsLogger: new LocalLogger()
      });
    case SET_VEGA_LITE_EXAMPLE:
      spec = JSON.parse(action.spec);
      vegaSpec = spec;
      if (action.spec !== '{}') {
        vegaSpec = vl.compile(spec).spec;
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        selectedExample: action.example,
        error: null,
        warningsLogger: new LocalLogger()
      });
    case UPDATE_VEGA_LITE_SPEC: {
      const currLogger = new LocalLogger();
      try {
        spec = JSON.parse(action.spec);
        validateVegaLite(spec, currLogger);
        vegaSpec = vl.compile(spec, currLogger).spec;
      } catch (e) {
        console.warn(e);
        return Object.assign({}, state, {
          mode: MODES.VegaLite,
          error: e.message,
          editorString: action.spec,
          warningsLogger: currLogger,
          selectedExample: null
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        error: null,
        warningsLogger: currLogger,
        selectedExample: null
      });
    }
    case SET_GIST_VEGA_SPEC: {
      const currLogger = new LocalLogger();
      try {
        spec = JSON.parse(action.spec);
        validateVega(spec, currLogger);
      } catch(e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          warningsLogger: currLogger,
          error: e.message,
          editorString: action.spec
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        gist: action.gist,
        error: null
      });
    }
    case SET_GIST_VEGA_LITE_SPEC: {
      const currLogger = new LocalLogger();
      try {
        spec = JSON.parse(action.spec);
        validateVegaLite(spec, currLogger);
        vegaSpec = vl.compile(spec, currLogger).spec;
      } catch(e) {
        console.warn(e);
        return Object.assign({}, state, {
          warningsLogger: currLogger,
          error: e.message,
          editorString: action.spec
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
    }
    case TOGGLE_AUTO_PARSE:
      return Object.assign({}, state, {
        autoParse: !state.autoParse,
        parse: !state.autoParse
      });
    case CYCLE_RENDERER: {
      const rendererVals = Object.values(RENDERERS);
      const currentRenderer = rendererVals.indexOf(state.renderer);
      const nextRenderer = rendererVals[(currentRenderer + 1) % rendererVals.length];
      return Object.assign({}, state, {
        renderer: nextRenderer
      });
    }
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
    case UPDATE_EDITOR_STRING: 
      return Object.assign({}, state, {
        editorString: action.editorString
      });
    case SHOW_TOOLTIP: 
      return Object.assign({}, state, {
        tooltip: !state.tooltip
      });
    default:
      return state;
  }
}
