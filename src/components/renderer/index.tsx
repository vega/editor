/** @prettier */

import {connect} from 'react-redux';
import Renderer from './renderer';
function mapStateToProps(state, ownProps) {
  return {
    vegaSpec: state.vegaSpec,
    vegaLiteSpec: state.vegaLiteSpec,
    renderer: state.renderer,
    mode: state.mode,
    tooltip: state.tooltip,
  };
}
export default connect(mapStateToProps)(Renderer);
