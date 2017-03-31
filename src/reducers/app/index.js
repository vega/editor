import vl from 'vega-lite';

import { UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC, TOGGLE_DEBUG, CYCLE_RENDERER, SET_VEGA_EXAMPLE, SET_VEGA_LITE_EXAMPLE, 
  SHOW_COMPILED_VEGA_SPEC, SET_GIST_VEGA_SPEC, SET_GIST_VEGA_LITE_SPEC } from '../../actions/editor';
import { MODES, RENDERERS } from '../../constants';

export default (state = {
  editorString: JSON.stringify({}, null, 2),
  vegaSpec: {},
  vegaLiteSpec: null,
  selectedExample: null,
  mode: MODES.Vega,
  debug: false,
  renderer: RENDERERS.Canvas,
  compiledVegaSpec: false,
  gist: null
}, action) => {
  let spec, vegaSpec;
  switch (action.type) {
    case UPDATE_VEGA_SPEC:
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
        return state;
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec
      });
    case SET_VEGA_EXAMPLE:
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
        return state;
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        selectedExample: action.example
      });
    case SET_VEGA_LITE_EXAMPLE:
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec).spec;
        console.log('Generated Vega spec', JSON.stringify(vegaSpec))
      } catch (e) {
        console.warn('Error parsing json string');
        return state;
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        selectedExample: action.example
      });
    case UPDATE_VEGA_LITE_SPEC:
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec).spec;
        console.log('Generated Vega spec', JSON.stringify(vegaSpec))
      } catch (e) {
        console.warn('Error parsing json string');
        return state;
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec
      });
    case SET_GIST_VEGA_SPEC:
      try {
        spec = JSON.parse(action.spec);
      } catch(e) {
        console.warn('Error parsing json string');
        return state;
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        mode: MODES.Vega,
        editorString: action.spec,
        gist: action.gist
      });
    case SET_GIST_VEGA_LITE_SPEC:
      try {
        spec = JSON.parse(action.spec);
        vegaSpec = vl.compile(spec).spec;
        console.log('Generated Vega spec', JSON.stringify(vegaSpec))
      } catch(e) {
        console.warn('Error parsing json string');
        return state;
      }
      return Object.assign({}, state, {
        vegaLiteSpec: spec,
        vegaSpec: vegaSpec,
        mode: MODES.VegaLite,
        editorString: action.spec,
        gist: action.gist
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
