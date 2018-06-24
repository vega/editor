import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

const mapStateToProps = (state: State, ownProps) => {
  return {
    autoParse: state.autoParse,
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
    toggleAutoParse: () => {
      dispatch(EditorActions.toggleAutoParse());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
