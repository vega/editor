import {connect} from 'react-redux';

import {State} from '../../constants/default-state.js';
import Renderer from './renderer.js';

export function mapStateToProps(state: State) {
  return {
    error: state.error,
    errors: state.errors,
    warns: state.warns,
    debugs: state.debugs,
    infos: state.infos,
  };
}

export default connect(mapStateToProps)(Renderer);
