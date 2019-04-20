import { connect } from 'react-redux';
import { State } from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    mode: state.mode,
  };
}

export default connect(mapStateToProps)(Renderer);
