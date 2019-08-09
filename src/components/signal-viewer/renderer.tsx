import React from 'react';
import * as vega from 'vega';
import { mapStateToProps } from '.';
import './index.css';
import SignalRow from './signalRow';
import { deepEqual } from 'vega-lite/build/src/util';

type Props = ReturnType<typeof mapStateToProps>;

export default class SignalViewer extends React.PureComponent<Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      keys: [],
      signals: [],
    };
  }

  public getSignals() {
    const obj = {};
    this.state.keys.map(key => {
      obj[key] = this.props.view.signal(key);
    });
    if (!deepEqual(obj, this.state.signals[this.state.signals.length - 1])) {
      this.setState({
        signals: this.state.signals.concat(obj),
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.view !== nextProps.view) {
      const keys = Object.keys(
        nextProps.view.getState({ data: vega.falsy, signals: vega.truthy, recurse: true }).signals
      );
      console.log(keys);
      this.setState(
        {
          signals: [],
          keys,
        },
        () => {
          this.getSignals();
        }
      );
    }
  }

  componentDidMount() {
    const keys = Object.keys(
      this.props.view.getState({ data: vega.falsy, signals: vega.truthy, recurse: true }).signals
    );
    this.setState(
      {
        keys,
      },
      () => {
        this.getSignals();
      }
    );
  }

  public valueChange = (key, value) => {
    if (key === 'width' || key === 'height' || key === 'padding' || key === 'autosize' || key === 'cursor') {
      return;
    }
    this.getSignals();
  };

  public render() {
    return (
      <>
        <div style={{ border: '1px solid black', width: '300', height: '300' }}>
          <div style={{ display: 'inline-block', border: '1px solid magenta' }}>
            {this.state.keys.map(key => {
              if (key === 'width' || key === 'height' || key === 'padding' || key === 'autosize' || key === 'cursor') {
                return null;
              }
              return this.state.signals.map(signal => {
                return (
                  <div style={{ display: 'block' }}>
                    <div style={{ width: 30, height: 30, border: '1px solid red' }}></div>
                  </div>
                );
              });
            })}
          </div>
        </div>
        <div className="signal-viewer">
          <table className="editor-table">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {this.state.keys.map(signal => (
                <SignalRow
                  onValueChange={(key, value) => this.valueChange(key, value)}
                  key={signal}
                  signal={signal}
                  view={this.props.view}
                />
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}
