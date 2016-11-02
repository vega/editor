/* global vg, vl */

import defaultVegaSpec from '../../../spec/vega/arc.json';
import { UPDATE_VEGA_SPEC, UPDATE_VEGA_LITE_SPEC } from '../../actions/editor';
import { MODES } from '../../constants';

export default (state = {
  editorString: JSON.stringify(defaultVegaSpec, null, 2),
  vegaSpec: defaultVegaSpec,
  vegaLiteSpec: null,
  mode: MODES.Vega,
  debug: false,
  renderTarget: 'svg'
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
    default:
      return state;
  }
}
