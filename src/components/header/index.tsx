import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    editorString: state.editorString,
    lastPosition: state.lastPosition,
    manualParse: state.manualParse,
    mode: state.mode,
    vegaLiteSpec: state.vegaLiteSpec,
    vegaSpec: state.vegaSpec,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch) {
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
    setScrollPosition: (position: number) => {
      dispatch(EditorActions.setScrollPosition(position));
    },
    toggleAutoParse: () => {
      dispatch(EditorActions.toggleAutoParse());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
