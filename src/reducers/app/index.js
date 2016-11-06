import vl from 'vega-lite';

import { UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC, TOGGLE_DEBUG, CYCLE_RENDERER } from '../../actions/editor';
import { MODES, RENDERERS } from '../../constants';

export default (state = {
  editorString: JSON.stringify({}, null, 2),
  vegaSpec: {},
  vegaLiteSpec: null,
  mode: MODES.Vega,
  debug: false,
  renderer: RENDERERS.Canvas
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
    default:
      return state;
  }
}
