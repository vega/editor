import {connect} from 'react-redux';
import {State} from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    baseURL: state.baseURL,
    config: state.config,
    editorString: state.editorString,
    mode: state.mode,
    vegaLiteSpec: state.vegaLiteSpec,
    vegaSpec: state.vegaSpec,
    view: state.view,
  };
}

export default connect(mapStateToProps)(Renderer);
