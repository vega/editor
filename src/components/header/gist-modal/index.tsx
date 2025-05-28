import {connect} from 'react-redux';
import {State} from '../../../constants/default-state.js';
import Renderer from './renderer.js';

export function mapStateToProps(state: State) {
  return {
    handle: state.handle,
    isAuthenticated: state.isAuthenticated,
    mode: state.mode,
    private: state.private,
  };
}

export default connect(mapStateToProps)(Renderer);
