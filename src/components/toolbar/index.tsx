import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    mode: state.mode,
    renderer: state.renderer,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    setRenderer: val => {
      dispatch(EditorActions.setRenderer(val));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
