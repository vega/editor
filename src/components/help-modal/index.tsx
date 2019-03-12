import React from 'react';
import { AlertCircle, Slack, Twitter } from 'react-feather';
import './index.css';

const HelpModal = () => {
  return (
    <div className="help-header">
      <h2>Help</h2>
      <h4>Keyboard Shortcuts</h4>
      <ul className="keyboard-shortcuts">
        <li>
          <kbd>Ctrl</kbd> + <kbd>b</kbd> / <kbd>&#8984;</kbd> + <kbd>b</kbd>: Execute the code in manual mode
        </li>
        <li>
          <kbd>Ctrl</kbd> + <kbd>?</kbd> / <kbd>&#8984;</kbd> + <kbd>'</kbd>: Open the help window
        </li>
        <li>
          <kbd>Ctrl</kbd> + <kbd>Space</kbd> / <kbd>&#8984;</kbd> + <kbd>Space</kbd>: Open Intellisense
        </li>
        <li>
          <kbd>Alt</kbd> + <kbd> Shift </kbd> + <kbd> f </kbd> / <kbd>&#8997;</kbd> + <kbd>&#8984;</kbd> + <kbd>f</kbd>:
          Auto format
        </li>
        <li>
          <kbd>Ctrl</kbd> + <kbd> f11 </kbd> / <kbd>&#8984;</kbd> + <kbd>f11</kbd>: Toggle Fullscreen Mode
        </li>
      </ul>
      <a href="https://github.com/vega/editor/issues/new" target="_blank" className="report-button">
        <AlertCircle className="header-icon" />
        Report a Bug{' '}
      </a>
      <h2>Have a feedback? Let us know</h2>
      <a href="https://bit.ly/join-vega-slack" target="_blank" className="link-to-docs">
        <Slack className="doc-image" />
        Join our slack channel
      </a>
      <a href="https://twitter.com/vega_vis" target="_blank" className="link-to-docs">
        <Twitter className="doc-image" />
        Follow us on twitter
      </a>
      <h2>References</h2>
      <a href="https://vega.github.io/vega-lite/" target="_blank" className="link-to-docs">
        Vega-lite Docs
      </a>
      <a href="https://vega.github.io/vega/" target="_blank" className="link-to-docs">
        Vega Docs
      </a>
      <h2>Tips</h2>
      <div className="tips">
        1. You can access Vega, Vega-Lite, and the <a href="https://vega.github.io/vega/docs/api/view/"> Vega view</a>{' '}
        at <code>(VEGA_DEBUG)</code> using your browser's developer console.
      </div>
    </div>
  );
};

export default HelpModal;
