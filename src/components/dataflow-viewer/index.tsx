import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {State} from '../../constants/default-state';
import * as EditorActions from '../../actions/editor';

import DataflowViewerErrorBoundary from './DataflowViewerErrorBoundary';

function mapStateToProps(state: State) {
  return {
    runtime: state.runtime,
    pulses: state.pulses,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearPulses: EditorActions.clearPulses,
    },
    dispatch
  );
}
export type StoreProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(DataflowViewerErrorBoundary);
