import {connect} from 'react-redux';

import {State} from '../../constants/default-state';
import Renderer from './renderer';

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
