import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

const mapStateToProps = (state: State, ownProps) => {
  return {
    editorString: state.editorString,
    lastPosition: state.lastPosition,
    manualParse: state.manualParse,
    mode: state.mode,
    vegaLiteSpec: state.vegaLiteSpec,
    vegaSpec: state.vegaSpec,
    view: state.view,
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
    setScrollPosition: position => {
      dispatch(EditorActions.setScrollPosition(position));
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
