import React from 'react';
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
  public render() {
    return (
      <div className="signal-viewer">
        <table>
          <tbody>
            <tr>
              <th>Signal</th>
              <th>Value</th>
            </tr>
            {Object.keys(this.props.view['_signals' as any]).map(signal => (
              <SignalRow key={signal} signal={signal} view={this.props.view} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
