import defaultVegaSpec from '../../../spec/vega/arc.json';
import { UPDATE_VEGA_SPEC } from '../../actions/editor';
import { MODES } from '../../constants';

export default (state = {
  editorString: JSON.stringify(defaultVegaSpec, null, 2),
  vegaSpec: defaultVegaSpec,
  vegaLiteSpec: null,
  mode: MODES.Vega,
  debug: true,
  renderTarget: 'svg'
}, action) => {
  switch (action.type) {
    case UPDATE_VEGA_SPEC:
      let spec = state.vegaSpec;
      try {
        spec = JSON.parse(action.spec);
      } catch (e) {
        console.warn('Error parsing json string');
      }
      return Object.assign({}, state, {
        vegaSpec: spec,
        editorString: action.spec
      });
    default:
      return state;
  }
}
