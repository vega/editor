import Renderer from './renderer.js';

export default Renderer;

// Keeping these for reference during migration
/*
import {connect} from 'react-redux';
import {State} from '../../constants/default-state.js';
import Renderer from './renderer.js';

export function mapStateToProps(state: State) {
  return {
    isAuthenticated: state.isAuthenticated,
  };
}

export default connect(mapStateToProps)(Renderer);
*/
