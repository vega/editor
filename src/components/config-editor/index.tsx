import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import './config-editor.css';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    config: state.config,
    configEditorString: state.configEditorString,
    manualParse: state.manualParse,
    sidePaneItem: state.sidePaneItem,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setConfig: EditorActions.setConfig,
      setConfigEditorString: EditorActions.setConfigEditorString,
      setEditorReference: EditorActions.setEditorReference,
      setThemeName: EditorActions.setThemeName,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
