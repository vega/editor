import { connect } from 'react-redux';

import Renderer from './renderer';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';

function mapStateToProps(state: State, ownProps) {
  return {
    autoParse: state.autoParse,
    error: state.error,
    export: state.export,
    mode: state.mode,
    renderer: state.renderer,
    warningsLogger: state.warningsLogger,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    exportVega: val => {
      dispatch(EditorActions.exportVega(val));
    },
    setRenderer: val => {
      dispatch(EditorActions.setRenderer(val));
    },
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    },
    toggleAutoParse: () => {
      dispatch(EditorActions.toggleAutoParse());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
