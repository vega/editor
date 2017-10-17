import {connect} from 'react-redux';

import Renderer from './renderer';

function mapStateToProps(state, ownProps) {
  return {
    errorPane: state.errorPane
  };
}
export default connect(mapStateToProps)(Renderer);
