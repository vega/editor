import React from 'react';
import * as vega from 'vega';
import {mapStateToProps} from '.';
import './index.css';
import SignalRow from './signalRow';

type StoreProps = ReturnType<typeof mapStateToProps>;

interface OwnComponentProps {
  onClickHandler: (header: string) => void;
}

type Props = StoreProps & OwnComponentProps;

export default class SignalViewer extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  public getSignals() {
    return Object.keys(
      this.props.view.getState({
        data: vega.falsy,
        signals: vega.truthy,
        recurse: true
      }).signals
    );
  }

  public render() {
    return (
      <div className="signal-viewer">
        <table className="editor-table">
          <thead>
            <tr>
              <th>Signal</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {this.getSignals().map(signal => (
              <SignalRow
                onClickHandler={header => this.props.onClickHandler(header)}
                key={signal}
                signal={signal}
                view={this.props.view}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
