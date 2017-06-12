import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    vegaSpec: state.app.vegaSpec,
    renderer: state.app.renderer,
    render: state.app.render,
    autoParse: state.app.autoParse
  };
}


const mapDispatchToProps = function (dispatch) {
  return {
    setNextRender: (val) => {
      dispatch(EditorActions.setNextRender(val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
