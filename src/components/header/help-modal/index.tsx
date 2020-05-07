import React from 'react';
import {AlertCircle, Slack, Twitter} from 'react-feather';
import {version as VG_VERSION} from 'vega';
import {version as VL_VERSION} from 'vega-lite';
import {version as TOOLTIP_VERSION} from 'vega-tooltip';
import isMac from '../../../utils/isMac';
import shortcuts from '../../../utils/keyboardShortcuts';
import './index.css';
const pjson = require('../../../../package.json');

// Will generate keyboard shortcuts based on OS
// 1. Check OS (isMac)
// 2. Then get the shortcuts
// 3. Map over shorcuts and render os specific
// 4. Get shortcut, split it, and map over it to render
// 5. To add shortcuts go to utils/keyboardShortcuts.ts, changes will be reflected here

const keyBoardShortcuts = shortcuts.map((shortcut, i) => {
  return (
    <li key={i}>
      {(isMac() ? shortcut.mac : shortcut.windows)
        .split(' ')
        .map((key) => (key === '+' ? '+' : <kbd key={`${key}${i}`}>{key}</kbd>))}
      : {shortcut.text}
    </li>
  );
});

const HelpModal = () => {
  return (
    <div className="help-modal">
      <h1>Help</h1>
      <h2>References</h2>
      <div className="doc-link">
        <a href="https://vega.github.io/vega-lite/" target="_blank" rel="noopener noreferrer">
          Vega-Lite Docs
        </a>
      </div>
      <div className="doc-link">
        <a href="https://vega.github.io/vega/" target="_blank" rel="noopener noreferrer">
          Vega Docs
        </a>
      </div>
      <h2>Keyboard Shortcuts</h2>
      <ul className="keyboard-shortcuts">{keyBoardShortcuts}</ul>
      <p>
        Access editor actions by clicking the Commands button or pressing <kbd>f1</kbd>.<br />
        Here you can clear the spec, extract or merge the config, or format the specification.
      </p>
      <a
        href={`https://github.com/vega/editor/issues/new?body=**Vega-Editor ${pjson.version}**`}
        target="_blank"
        rel="noopener noreferrer"
        className="report-button button"
      >
        <AlertCircle className="header-icon" />
        <span>Report a Bug</span>
      </a>
      <h2>Send us your feedback</h2>
      <a href="https://bit.ly/join-vega-slack" target="_blank" rel="noopener noreferrer" className="doc-link">
        <Slack className="doc-image" />
        Join our Slack channel
      </a>
      <a href="https://twitter.com/vega_vis" target="_blank" rel="noopener noreferrer" className="doc-link">
        <Twitter className="doc-image" />
        Follow us on Twitter
      </a>
      <h2>Tip</h2>
      <p>
        You can access Vega, Vega-Lite, and the{' '}
        <a href="https://vega.github.io/vega/docs/api/view/" target="_blank" rel="noopener noreferrer">
          Vega view
        </a>{' '}
        at <code>(VEGA_DEBUG)</code> using your browser's developer console.
      </p>
      <h2>Versions</h2>
      <ul>
        <li>Vega: {VG_VERSION}</li>
        <li>Vega-Lite: {VL_VERSION}</li>
        <li>Vega-Tooltip: {TOOLTIP_VERSION}</li>
        <li>Editor: {pjson.version}</li>
      </ul>
    </div>
  );
};

export default HelpModal;
