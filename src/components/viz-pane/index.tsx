import {connect} from 'react-redux';

import {State} from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    errorPane: state.errorPane,
  };
}

export default connect(mapStateToProps)(Renderer);
