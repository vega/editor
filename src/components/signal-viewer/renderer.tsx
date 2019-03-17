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
          <tr>
            <th>Signal</th>
            <th>Value</th>
          </tr>
          <tbody>
            {Object.keys(this.props.view[KEY]).map((signal, id) => (
              <SignalRow key={id} signal={signal} view={this.props.view} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
