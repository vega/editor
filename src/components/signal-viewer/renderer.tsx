import React from 'react';

import { View } from '../../constants';
import SignalRow from '../signal';

import './index.css';

const KEY = '_signals';

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
            {Object.keys(this.props.view[KEY]).map(signal => (
              <SignalRow key={signal} signal={signal} view={this.props.view} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
