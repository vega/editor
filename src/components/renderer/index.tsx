import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

const mapStateToProps = (state: State, ownProps) => {
  return {
    baseURL: state.baseURL,
    export: state.export,
    mode: state.mode,
    renderer: state.renderer,
    vegaLiteSpec: state.vegaLiteSpec,
    vegaSpec: state.vegaSpec,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    exportVega: val => {
      dispatch(EditorActions.exportVega(val));
    },
    setView: val => {
      dispatch(EditorActions.setView(val));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
