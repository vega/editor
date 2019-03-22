import { connect } from 'react-redux';
import { NAVBAR } from '../../constants';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State) {
  return {
    view: state.view,
  };
}

export default connect(mapStateToProps)(Renderer);
