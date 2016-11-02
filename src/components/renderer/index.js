import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    vegaSpec: state.app.vegaSpec
  };
}


export default connect(mapStateToProps)(Renderer);
