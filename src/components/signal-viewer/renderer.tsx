import React from 'react';
import * as vega from 'vega';
import { View } from '../../constants';
import './index.css';
import SignalRow from './signalRow';

interface Props {
  view?: View;
}

export default class SignalViewer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  public getSignals() {
    return Object.keys(this.props.view.getState({ data: vega.falsy, signals: vega.truthy, recurse: true }).signals);
  }

  public render() {
    return (
      <div className="signal-viewer">
        <table>
          <tbody>
            <tr>
              <th>Signal</th>
              <th>Value</th>
            </tr>
            {this.getSignals().map(signal => (
              <SignalRow key={signal} signal={signal} view={this.props.view} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
