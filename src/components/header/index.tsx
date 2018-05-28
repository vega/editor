import { connect } from 'react-redux';

import { State } from '../../constants/default-state';
import Renderer from './renderer';

const mapStateToProps = (state: State, ownProps) => {
  return {
    mode: state.mode,
  };
};

export default connect(
  mapStateToProps,
  null
)(Renderer);
