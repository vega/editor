import { connect } from 'react-redux';

import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    debugPane: state.debugPane,
    view: state.view,
  };
}

export default connect(mapStateToProps)(Renderer);
