import * as React from 'react';
import {connect, useDispatch, useSelector} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor.js';
import {SIDEPANE} from '../../../constants/index.js';
import {State} from '../../../constants/default-state.js';
import ConfigEditorHeader from '../../config-editor/config-editor-header.js';
import './index.css';

function SpecEditorHeader() {
  const props = useSelector((state: State) => mapStateToProps(state));
  const dispatch = useDispatch();
  const dispatchProps = mapDispatchToProps(dispatch);

  return (
    <div className="editor-header spec-editor-header">
      <ul className="tabs-nav">
        <li
          className={props.sidePaneItem === SIDEPANE.Editor ? 'active-tab' : undefined}
          onClick={(e) => {
            if (props.sidePaneItem === SIDEPANE.Editor) {
              e.stopPropagation();
            }
            e.stopPropagation();
            dispatchProps.setSidePaneItem(SIDEPANE.Editor);
          }}
        >
          {props.mode}
        </li>

        <li
          className={props.sidePaneItem === SIDEPANE.Config ? 'active-tab' : undefined}
          onClick={(e) => {
            if (props.sidePaneItem === SIDEPANE.Config) {
              e.stopPropagation();
            }
            e.stopPropagation();
            dispatchProps.setSidePaneItem(SIDEPANE.Config);
          }}
        >
          Config
        </li>
      </ul>

      {props.sidePaneItem === SIDEPANE.Config && <ConfigEditorHeader />}
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    compiledVegaSpec: state.compiledVegaSpec,
    configEditorString: state.configEditorString,
    editorString: state.editorString,
    manualParse: state.manualParse,
    mode: state.mode,
    sidePaneItem: state.sidePaneItem,
    themeName: state.themeName,
    value: state.vegaSpec,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setSidePaneItem: EditorActions.setSidePaneItem,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SpecEditorHeader);
