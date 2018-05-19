import {connect} from 'react-redux';

import {State} from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    vegaSpec: state.vegaSpec,
    vegaLiteSpec: state.vegaLiteSpec,
    renderer: state.renderer,
    mode: state.mode,
    export: state.export,
    exportPDF: state.exportPDF,
    baseURL: state.baseURL,
  };
}

export default connect(mapStateToProps)(Renderer);
