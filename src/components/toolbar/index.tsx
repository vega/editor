import {connect} from 'react-redux';

import Renderer from './renderer';

import * as EditorActions from '../../actions/editor';
import {State} from '../../constants/default-state';

function mapStateToProps(state: State, ownProps) {
  return {
    renderer: state.renderer,
    error: state.error,
    mode: state.mode,
    autoParse: state.autoParse,
    warningsLogger: state.warningsLogger,
    export: state.export,
    exportPDF: state.exportPDF,
  };
}

const mapDispatchToProps = function(dispatch) {
  return {
    toggleAutoParse: () => {
      dispatch(EditorActions.toggleAutoParse());
    },
    setRenderer: (val) => {
      dispatch(EditorActions.setRenderer(val));
    },
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    },
    exportVega: (val) => {
      dispatch(EditorActions.exportVega(val));
    },
    exportPDF: (val) => {
      dispatch(EditorActions.exportPDF(val));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
