import React from 'react';
import * as vega from 'vega';
import { View } from '../../constants';

import './index.css';

interface Props {
  view?: View;
  debugPane: boolean;
}

export default class SignalViewer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }
  public render() {
    const key = '_signals';
    return (
      <div className="signal-viewer">
        <h3>Signals</h3>
        {Object.keys(this.props.view[key]).map((signal, id) => (
          <p key={id}>{signal}</p>
        ))}
      </div>
    );
  }
}
