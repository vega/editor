import {connect} from 'react-redux';

import {State} from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    error: state.error,
    warningsLogger: state.warningsLogger,
  };
}

export default connect(mapStateToProps)(Renderer);
