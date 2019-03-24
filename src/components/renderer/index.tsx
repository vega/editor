import { connect } from 'react-redux';
import { View } from 'vega';
import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    baseURL: state.baseURL,
    editorString: state.editorString,
    mode: state.mode,
    renderer: state.renderer,
    vegaLiteSpec: state.vegaLiteSpec,
    vegaSpec: state.vegaSpec,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    setView: (val: View) => {
      dispatch(EditorActions.setView(val));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
