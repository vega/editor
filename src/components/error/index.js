import Renderer from './renderer';
import { connect } from 'react-redux';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    error: state.app.error
  };
}

function mapDispatchToProps(dispatch) {
  return {
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
