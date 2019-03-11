import React from 'react';
import { AlertCircle } from 'react-feather';
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
      </ul>
      <a href="https://github.com/vega/editor/issues/new" target="_blank" className="report-button">
        <AlertCircle className="header-icon" />
        Report a Bug{' '}
      </a>
      <br />
      <h2>Have a feedback? Let us know</h2>
      <a href="https://bit.ly/join-vega-slack" target="_blank">
        Join our slack channel
      </a>
      <br />
      <h2>References</h2>
      <a href="https://vega.github.io/vega-lite/" target="_blank">
        Vega-lite Docs
      </a>
      <a href="https://vega.github.io/vega/" target="_blank">
        Vega Docs
      </a>
    </div>
  );
};

export default HelpModal;
