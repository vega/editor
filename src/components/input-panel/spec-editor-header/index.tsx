import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import * as EditorActions from '../../../actions/editor.js';
import {SIDEPANE} from '../../../constants/consts.js';
import {State} from '../../../constants/default-state.js';
import ConfigEditorHeader from '../../config-editor/config-editor-header.js';
import './index.css';

function SpecEditorHeader() {
  const {sidePaneItem, mode} = useSelector((state: State) => ({
    sidePaneItem: state.sidePaneItem,
    mode: state.mode,
  }));
  const dispatch = useDispatch();

  const setSidePaneItem = (item) => {
    dispatch(EditorActions.setSidePaneItem(item));
  };

  return (
    <div className="editor-header spec-editor-header">
      <ul className="tabs-nav">
        <li
          className={sidePaneItem === SIDEPANE.Editor ? 'active-tab' : undefined}
          onClick={() => setSidePaneItem(SIDEPANE.Editor)}
        >
          {mode}
        </li>

        <li
          className={sidePaneItem === SIDEPANE.Config ? 'active-tab' : undefined}
          onClick={() => setSidePaneItem(SIDEPANE.Config)}
        >
          Config
        </li>
      </ul>

      {sidePaneItem === SIDEPANE.Config && <ConfigEditorHeader />}
    </div>
  );
}

export default SpecEditorHeader;
