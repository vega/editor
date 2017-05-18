import * as vl from 'vega-lite';

import { UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC, TOGGLE_DEBUG, CYCLE_RENDERER, SET_VEGA_EXAMPLE, SET_VEGA_LITE_EXAMPLE,
  SHOW_COMPILED_VEGA_SPEC, SET_GIST_VEGA_SPEC, SET_GIST_VEGA_LITE_SPEC, SET_MODE } from '../../actions/editor';
import { MODES, RENDERERS } from '../../constants';

//const JSON3 = require('../../../lib/json3-compactstringify');
const stringify = require("json-stringify-pretty-compact");
//console.log(JSON3);

export default (state = {
  editorString: stringify({}, {maxLength: 60, indent: 2}),
  vegaSpec: {},
  vegaLiteSpec: null,
  selectedExample: null,
  mode: MODES.Vega,
  debug: false,
  renderer: RENDERERS.Canvas,
  compiledVegaSpec: false,
  gist: null,
  error: null
}, action) => {
  let spec, vegaSpec;
  switch (action.type) {
    case SET_MODE:
      return Object.assign({}, state, {
        mode: action.mode,
        vegaSpec: {},
        vegaLiteSpec: {},
        selectedExample: null,
        editorString: stringify({}, {maxLength: 60, indent: 2}),
        compiledVegaSpec: {},
        gist: null
      });
    case UPDATE_VEGA_SPEC:
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          error: e.message,
          editorString: stringify(spec, {maxLength: 60, indent: 2})
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: stringify(spec, {maxLength: 60, indent: 2}),
        error: null
      });
    case SET_VEGA_EXAMPLE:
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          error: e.message,
          editorString: stringify(spec, {maxLength: 60, indent: 2})
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: stringify(spec, {maxLength: 60, indent: 2}),
        selectedExample: action.example,
        error: null
      });
    case SET_VEGA_LITE_EXAMPLE:
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec).spec;
      } catch (e) {
        console.warn(e);
        return Object.assign({}, state, {
          error: e.message,
          editorString: stringify(spec, {maxLength: 60, indent: 2})
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: stringify(spec, {maxLength: 60, indent: 2}),
        selectedExample: action.example,
        error: null
      });
    case UPDATE_VEGA_LITE_SPEC:
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec).spec;
      } catch (e) {
        console.warn(e);
        return Object.assign({}, state, {
          error: e.message,
          editorString: stringify(spec, {maxLength: 60, indent: 2})
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: stringify(spec, {maxLength: 60, indent: 2}),
        error: null
      });
    case SET_GIST_VEGA_SPEC:
      try {
        spec = JSON.parse(action.spec);
      } catch(e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          error: e.message,
          editorString: stringify(spec, {maxLength: 60, indent: 2})
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: stringify(spec, {maxLength: 60, indent: 2}),
        gist: action.gist,
        error: null
      });
    case SET_GIST_VEGA_LITE_SPEC:
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec).spec;
      } catch(e) {
        console.warn(e);
        return Object.assign({}, state, {
          error: e.message,
          editorString: stringify(spec, {maxLength: 60, indent: 2})
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: stringify(spec, {maxLength: 60, indent: 2}),
        gist: action.gist,
        error: null
      });
    case TOGGLE_DEBUG:
      return Object.assign({}, state, {
        debug: !state.debug,
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
    default:
      return state;
  }
}
