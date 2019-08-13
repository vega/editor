import stringify from 'json-stringify-pretty-compact';
import React from 'react';
import * as vega from 'vega';
import { deepEqual } from 'vega-lite/build/src/util';
import { mapDispatchToProps, mapStateToProps } from '.';
import './index.css';
import SignalRow from './signalRow';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

function getClosestValue(signalArray, timeStamp, key) {
  let i = 0;
  while (signalArray[i].timeStamp !== timeStamp) {
    i++;
  }
  while (signalArray[i] && signalArray[i - 1] && deepEqual(signalArray[i].value, signalArray[i - 1].value)) {
    i--;
  }
  return i;
}
export default class SignalViewer extends React.PureComponent<Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      keys: [],
      isHovered: false,
      hoverValue: {},
      maskListner: false,
      signal: {},
    };
  }

  public getKeys(_ref = this.props) {
    return Object.keys(_ref.view.getState({ data: vega.truthy, signals: vega.truthy, recurse: true }).signals);
  }

  public getSignals() {
    const obj = {};
    const keys = this.getKeys();
    keys.map(key => {
      obj[key] = this.props.view.signal(key);
    });
    (obj as any).timeStamp = Date.now();
    const prevSignal = { ...this.props.signals[this.props.signals.length - 1] };
    const newSignal: any = { ...obj };
    delete prevSignal.timeStamp;
    delete newSignal.timeStamp;
    if (!deepEqual(newSignal, prevSignal)) {
      this.props.addSignal(obj);
    }
  }

  public handleSetState(time) {
    this.setState({ maskListner: true });
    this.props.signals.forEach(signal => {
      if (signal.timeStamp === time) {
        this.setState({
          signal,
        });
        this.props.view.setState({
          signals: signal,
        });
      }
    });
    setTimeout(() => {
      this.setState({ maskListner: false });
    }, 100);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.view !== nextProps.view) {
      const keys = this.getKeys(nextProps);
      this.setState(
        {
          keys,
          signal: {},
        },
        () => {
          const obj = {};
          this.state.keys.map(key => {
            obj[key] = this.props.view.signal(key);
          });
          (obj as any).timeStamp = Date.now();
          this.props.setSignals([obj]);
        }
      );
    }
  }

  componentDidMount() {
    const keys = this.getKeys();
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
    const obj = {};
    this.props.signals.map(signal => {
      Object.keys(signal).map(key => {
        obj[key]
          ? obj[key].push({ value: signal[key], timeStamp: signal.timeStamp })
          : (obj[key] = [{ value: signal[key], timeStamp: signal.timeStamp }]);
      });
    });
    const colorObj = {};
    if (!deepEqual(this.state.signal, {})) {
      Object.keys(obj).map(key => {
        if (
          key === 'width' ||
          key === 'height' ||
          key === 'padding' ||
          key === 'autosize' ||
          key === 'cursor' ||
          key === 'timeStamp'
        ) {
          return;
        }
        if (!deepEqual(this.state.signal, {})) {
          const index = getClosestValue(obj[key], this.state.signal.timeStamp, key);
          colorObj[key] = index;
        }
      });
      console.log(colorObj);
    }
    return (
      <>
        <div style={{ position: 'absolute', top: '50%', right: 100 }}>
          {this.state.isHovered && <div>{stringify(this.state.hoverValue)}</div>}
        </div>
        <table className="debugger-table">
          {Object.keys(obj).map(k => {
            if (
              k === 'width' ||
              k === 'height' ||
              k === 'padding' ||
              k === 'autosize' ||
              k === 'cursor' ||
              k === 'timeStamp'
            ) {
              return null;
            }
            return (
              <tr>
                <td style={{ width: 100 }}>{k}</td>
                <td style={{ height: 20 }}>
                  <div style={{ width: window.innerWidth * 0.4 }}>
                    <svg className="debugger" style={{ width: '100%', height: '20' }}>
                      <g>
                        {obj[k].map((e, index) => {
                          const prev = { ...obj[k][index - 1] };
                          const next = { ...obj[k][index] };
                          delete prev.timeStamp;
                          delete next.timeStamp;
                          if (deepEqual(prev, next)) {
                            return null;
                          }
                          return (
                            <rect
                              className="svg-rect"
                              onMouseOver={() => this.setState({ isHovered: true, hoverValue: { [k]: e } })}
                              onMouseOut={() => this.setState({ isHovered: false, hoverValue: {} })}
                              width={(window.innerWidth * 0.4) / obj[k].length}
                              x={(index * window.innerWidth * 0.4) / obj[k].length}
                              height="20"
                              onClick={() => this.handleSetState(e.timeStamp)}
                              style={{
                                cursor: 'pointer',
                                fill: colorObj[k] === index ? 'green' : '#b7b7b7',
                                stroke: 'white',
                                strokeWidth: '0.5px',
                                pointerEvents: 'all',
                              }}
                            >
                              {stringify(e)}
                            </rect>
                          );
                        })}
                      </g>
                    </svg>
                  </div>
                </td>
              </tr>
            );
          })}
        </table>
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
                  maskListner={this.state.maskListner}
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
