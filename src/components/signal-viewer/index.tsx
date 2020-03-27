import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor';
import {State} from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    signals: state.signals,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      addSignal: EditorActions.addSignal,
      setSignals: EditorActions.setSignals,
      setView: EditorActions.setView,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
