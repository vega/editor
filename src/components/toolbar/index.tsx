import { connect } from 'react-redux';

import Renderer from './renderer';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';

function mapStateToProps(state: State, ownProps) {
  return {
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
