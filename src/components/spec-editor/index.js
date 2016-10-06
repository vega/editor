import { connect } from 'react-redux';
import Renderer from './renderer';

function mapStateToProps (state, ownProps) {
  return {
    value: state.app.editorString
  };
}

export default connect(mapStateToProps)(Renderer);
