import {connect} from 'react-redux';
import Renderer from './renderer';

const mapStateToProps = function(state, ownProps) {
  return {
    mode: state.mode
  };
};

export default connect(mapStateToProps, null)(Renderer);
