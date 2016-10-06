import { connect } from 'react-redux';
import Renderer from './renderer';

function mapStateToProps (state, ownProps) {
  return {
    vegaSpec: state.editor.vegaSpec
  };
}

export default connect(mapStateToProps)(Renderer);
