import {connect} from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

const mapDispatchToProps = function(dispatch) {
  return {
    logError: (err) => {
      dispatch(EditorActions.logError(err));
    }
  }
}

export default connect(null, mapDispatchToProps)(Renderer);
