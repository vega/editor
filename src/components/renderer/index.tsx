import {connect} from 'react-redux';

import {State} from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    vegaSpec: state.vegaSpec,
    vegaLiteSpec: state.vegaLiteSpec,
    renderer: state.renderer,
    mode: state.mode,
    tooltip: state.tooltip,
    export: state.export,
  };
}

export default connect(mapStateToProps)(Renderer);
