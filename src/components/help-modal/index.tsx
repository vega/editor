import React from 'react';
import { AlertCircle, Slack, Twitter } from 'react-feather';
import { version } from 'vega';
import { version as VegaLiteVersion } from 'vega-lite';
import isMac from '../../utils/isMac';
import shortcuts from '../../utils/keyboardShortcuts';
import './index.css';
const pjson = require('../../../package.json');

// Will generate keyboard shortcuts based on OS
// 1. Check OS (isMac)
// 2.Then get the shortcuts
// 3.Map over shorcuts and render os specific
// 4.Get shortcut , split it and mac over it to render
// 5.To add shortcuts goto utils/keyboardShortcuts.ts , changes will be reflected here
const keyBoardShortcuts = shortcuts.map(shortcut => {
  return isMac() ? (
    <li>
      {shortcut.mac.split(' ').map(key => (key === '+' ? '+' : <kbd>{key}</kbd>))} : {shortcut.text}
    </li>
  ) : (
    <li>
      {shortcut.windows.split(' ').map(key => (key === '+' ? '+' : <kbd>{key}</kbd>))} : {shortcut.text}
    </li>
  );
});

const HelpModal = () => {
  return (
    <div className="parent">
      <div className="help-header">
        <h1 className="modal-header">Help</h1>
        <h2 className="modal-title">Keyboard Shortcuts</h2>
        <ul className="keyboard-shortcuts">{keyBoardShortcuts}</ul>
        <a href="https://github.com/vega/editor/issues/new" target="_blank" className="report-button help-modal-link">
          <AlertCircle className="header-icon" />
          Report a Bug{' '}
        </a>
        <h2 className="modal-title">Have a feedback? Let us know</h2>
        <a href="https://bit.ly/join-vega-slack" target="_blank" className="link-to-docs help-modal-links">
          <Slack className="doc-image" />
          Join our Slack channel
        </a>
        <a href="https://twitter.com/vega_vis" target="_blank" className="link-to-docs help-modal-links">
          <Twitter className="doc-image" />
          Follow us on Twitter
        </a>
        <h2 className="modal-title">References</h2>
        <a href="https://vega.github.io/vega-lite/" target="_blank" className="link-to-docs help-modal-links">
          Vega-lite Docs
        </a>
        <a href="https://vega.github.io/vega/" target="_blank" className="link-to-docs help-modal-links">
          Vega Docs
        </a>
        <h2 className="modal-title">Tip</h2>
        <div className="tips">
          You can access Vega, Vega-Lite, and the <a href="https://vega.github.io/vega/docs/api/view/"> Vega view</a> at{' '}
          <code>(VEGA_DEBUG)</code> using your browser's developer console.
        </div>
        <div className="version-viewer">
          <div>Vega Version : {version}</div>
          <div>Vega-lite Version : {VegaLiteVersion}</div>
          <div>Editor Version : {pjson.version}</div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
