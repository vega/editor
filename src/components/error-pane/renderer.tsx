import './index.css';

import * as React from 'react';

interface Props {
  error;
  warningsLogger;
}

export default class ErrorPane extends React.Component<Props> {
  public render() {
    const list = [];
    if (this.props.error) {
      list.push(
        <li key={0}>
          <span className="error">[Error] </span>
          {this.props.error}
        </li>
      );
    }
    this.props.warningsLogger.warns.forEach((warning, i) => {
      list.push(
        <li key={i + 1}>
          <span className="warning">[Warning] </span>
          {warning}
        </li>
      );
    });
    if (list.length === 0) {
      list.push(
        <li key={'no error'}>
          <span className="info">[Info] </span>
          No error or warnings
        </li>
      );
    }
    return (
      <div className="error-pane">
        <ul>{list}</ul>
      </div>
    );
  }
}
