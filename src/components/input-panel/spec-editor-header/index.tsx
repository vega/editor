import * as React from 'react';
import {useAppContext} from '../../../context/app-context.js';
import {SIDEPANE} from '../../../constants/consts.js';
import ConfigEditorHeader from '../../config-editor/config-editor-header.js';
import './index.css';

function SpecEditorHeader() {
  const {state, setState} = useAppContext();
  const {sidePaneItem, mode} = state;

  const setSidePaneItem = (item) => {
    setState((s) => ({...s, sidePaneItem: item}));
  };

  return (
    <div className="editor-header spec-editor-header">
      <ul className="tabs-nav">
        <li
          className={sidePaneItem === SIDEPANE.Editor ? 'active-tab' : undefined}
          onClick={(e) => {
            if (sidePaneItem === SIDEPANE.Editor) {
              e.stopPropagation();
            }
            e.stopPropagation();
            setSidePaneItem(SIDEPANE.Editor);
          }}
        >
          {mode}
        </li>

        <li
          className={sidePaneItem === SIDEPANE.Config ? 'active-tab' : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (sidePaneItem !== SIDEPANE.Config) {
              setSidePaneItem(SIDEPANE.Config);
            }
          }}
        >
          Config
        </li>
      </ul>

      {sidePaneItem === SIDEPANE.Config && <ConfigEditorHeader />}
    </div>
  );
}

export default SpecEditorHeader;
