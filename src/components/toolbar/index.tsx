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
    tooltip: state.tooltip,
    export: state.export,
  };
}

const mapDispatchToProps = function(dispatch) {
  return {
    toggleAutoParse: () => {
      dispatch(EditorActions.toggleAutoParse());
    },
    cycleRenderer: () => {
      dispatch(EditorActions.cycleRenderer());
    },
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    },
    showTooltip: () => {
      dispatch(EditorActions.showTooltip());
    },
    exportVega: (val) => {
      dispatch(EditorActions.exportVega(val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
