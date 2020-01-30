import './index.css';

import * as React from 'react';
import {mapStateToProps} from '.';

type Props = ReturnType<typeof mapStateToProps>;

export default class ErrorPane extends React.PureComponent<Props> {
  public render() {
    const list = [];
    if (this.props.error) {
      list.push(
        <li key={0}>
          <span className="error-pane__list-item error-pane__list-item--error">[Error] </span>
          {this.props.error.message}
        </li>
      );
    }
    this.props.warningsLogger.warns.forEach((warning, i) => {
      list.push(
        <li key={i + 1}>
          <span className="error-pane__list-item error-pane__list-item--warning">[Warning] </span>
          {warning}
        </li>
      );
    });
    if (list.length === 0) {
      list.push(
        <li key={'no error'}>
          <span className="error-pane__list-item error-pane__list-item--info">[Info] </span>
          No error or warnings
        </li>
      );
    }
    return (
      <div className="error-pane">
        <ul className="error-pane__list">{list}</ul>
      </div>
    );
  }
}
