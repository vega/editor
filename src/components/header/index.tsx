import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    configEditorString: state.configEditorString,
    editorRef: state.editorRef,
    lastPosition: state.lastPosition,
    manualParse: state.manualParse,
    mode: state.mode,
    settingState: state.settingState,
    vegaLiteSpec: state.vegaLiteSpec,
    vegaSpec: state.vegaSpec,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      exportVega: EditorActions.exportVega,
      parseSpec: EditorActions.parseSpec,
      setConfig: EditorActions.setConfig,
      setScrollPosition: EditorActions.setScrollPosition,
      setSettingState: EditorActions.setSettingState,
      toggleAutoParse: EditorActions.toggleAutoParse,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
