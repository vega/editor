import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    vegaSpec: state.app.vegaSpec,
    debug: state.app.debug
  };
}


const mapDispatchToProps = function (dispatch) {
  return {
    toggleDebug: () => {
      dispatch(EditorActions.toggleDebug());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
