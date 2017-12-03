import {connect} from 'react-redux';
import Renderer from './renderer';

function mapStateToProps(state, ownProps) {
  return {
    vegaSpec: state.vegaSpec,
    renderer: state.renderer,
    mode: state.mode,
    tooltip: state.tooltip
  };
}

export default connect(mapStateToProps)(Renderer);
