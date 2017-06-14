import * as vl from 'vega-lite';

import { UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC, PARSE_SPEC, TOGGLE_AUTO_PARSE, CYCLE_RENDERER, SET_VEGA_EXAMPLE, SET_VEGA_LITE_EXAMPLE,
  SHOW_COMPILED_VEGA_SPEC, SET_GIST_VEGA_SPEC, SET_GIST_VEGA_LITE_SPEC, SET_MODE } from '../../actions/editor';
import { MODES, RENDERERS } from '../../constants';

const JSON3 = require('../../../lib/json3-compactstringify');

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
        editorString: '{}',
        compiledVegaSpec: {},
        gist: null,
        parse: false
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
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        error: null
      });
    case SET_VEGA_EXAMPLE:
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        selectedExample: action.example,
        error: null
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
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        error: null
      });
    case SET_GIST_VEGA_SPEC:
      try {
        spec = JSON.parse(action.spec);
      } catch(e) {
        console.warn('Error parsing json string');
        return Object.assign({}, state, {
          error: e.message,
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
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
          editorString: JSON3.stringify(spec, null, 2, 60)
        });
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        gist: action.gist,
        error: null
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
    default:
      return state;
  }
}
