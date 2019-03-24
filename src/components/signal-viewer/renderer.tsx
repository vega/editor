import React from 'react';
import * as vega from 'vega';
import { mapStateToProps } from '.';
import './index.css';
import SignalRow from './signalRow';

type Props = ReturnType<typeof mapStateToProps>;

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
        <div className="signal-table">
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
      </div>
    );
  }
}
