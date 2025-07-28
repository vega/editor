import React from 'react';
import {GitHub, Slack} from 'react-feather';
import {version as VG_VERSION} from 'vega';
import {version as VL_VERSION} from 'vega-lite';
import {version as TOOLTIP_VERSION} from 'vega-tooltip';
import isMac from '../../../utils/isMac.js';
import shortcuts from '../../../utils/keyboardShortcuts.js';
import './index.css';

// Will generate keyboard shortcuts based on OS
// 1. Check OS (isMac)
// 2. Then get the shortcuts
// 3. Map over shorcuts and render os specific
// 4. Get shortcut, split it, and map over it to render
// 5. To add shortcuts go to utils/keyboardShortcuts.ts, changes will be reflected here

const keyBoardShortcuts = shortcuts.map((shortcut, i) => (
  <li key={i}>
    {(isMac() ? shortcut.mac : shortcut.windows)
      .split(' ')
      .map((key) => (key === '+' ? '+' : <kbd key={`${key}${i}`}>{key}</kbd>))}
    : {shortcut.text}
  </li>
));

export const COMMIT_HASH: string = process.env.VITE_COMMIT_HASH;

const HelpModal = () => (
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
    <h2>Send us your feedback</h2>
    <a href="https://bit.ly/join-vega-slack-2022" target="_blank" rel="noopener noreferrer" className="doc-link">
      <Slack className="doc-image" />
      Join our Slack channel
    </a>
    <br />
    <a
      href={`https://github.com/vega/editor/issues/new?body=**Vega-Editor ${COMMIT_HASH}**`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <GitHub className="doc-image" />
      Report a Bug
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
      <li>
        Editor: <a href={`https://github.com/vega/editor/commit/${COMMIT_HASH}`}>{COMMIT_HASH.slice(0, 7)}</a>
      </li>
    </ul>
  </div>
);

export default HelpModal;
