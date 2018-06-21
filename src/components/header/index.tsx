import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

const mapStateToProps = (state: State, ownProps) => {
  return {
    mode: state.mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    exportVega: val => {
      dispatch(EditorActions.exportVega(val));
    },
    formatSpec: val => {
      dispatch(EditorActions.formatSpec(val));
    },
    parseSpec: val => {
      dispatch(EditorActions.parseSpec(val));
    },
    updateEditorString: val => {
      dispatch(EditorActions.updateEditorString(val));
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
