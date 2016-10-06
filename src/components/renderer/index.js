import { connect } from 'react-redux';
import Renderer from './renderer';

function mapStateToProps (state, ownProps) {
  return {
    vegaSpec: state.app.vegaSpec
  };
}

export default connect(mapStateToProps)(Renderer);
