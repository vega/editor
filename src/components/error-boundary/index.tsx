/** @format */

import {connect} from 'react-redux';

import Renderer from './renderer';

import * as EditorActions from '../../actions/editor';

function mapStateToProps(state, ownProps) {
  return {
    error: state.error,
  };
}
const mapDispatchToProps = function(dispatch) {
  return {
    logError: (err) => {
      dispatch(EditorActions.logError(err));
    },
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
