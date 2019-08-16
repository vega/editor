import stringify from 'json-stringify-pretty-compact';
import React from 'react';
import * as vega from 'vega';
import { deepEqual } from 'vega-lite/build/src/util';
import { mapDispatchToProps, mapStateToProps } from '.';
import './index.css';
import SignalRow from './signalRow';
import TimelineRow from './TimelineRow';

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
      maxLength: 0,
      xCount: 0,
    };
  }

  public getKeys(_ref = this.props) {
    return Object.keys(_ref.view.getState({ data: vega.truthy, signals: vega.truthy, recurse: true }).signals);
  }

  public getSignals(changeKey = null) {
    if (changeKey) {
      const obj = {
        value: this.props.view.signal(changeKey),
      };
      const lastObj = this.props.signals[changeKey];
      const prevObj = { ...lastObj[lastObj.length - 1] };
      delete prevObj.xCount;
      if (!deepEqual(obj, prevObj)) {
        (obj as any).xCount = this.state.xCount;
        const newSignals = this.props.signals[changeKey].concat(obj);
        this.props.setSignals({ ...this.props.signals, [changeKey]: newSignals });
        this.setState(current => {
          return {
            ...current,
            xCount: current.xCount + 1,
          };
        });
      }
    } else {
      const obj = {};
      this.state.keys.map(key => {
        obj[key]
          ? obj[key].push({ value: this.props.view.signal(key), xCount: this.state.xCount })
          : (obj[key] = [{ value: this.props.view.signal(key), xCount: this.state.xCount }]);
      });
      this.props.setSignals(obj);
      this.setState({
        xCount: this.state.xCount + 1,
      });
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

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.view !== nextProps.view) {
  //     const keys = this.getKeys(nextProps);
  //     this.setState(
  //       {
  //         keys,
  //         signal: {},
  //       },
  //       () => {
  //         const obj = {};
  //         this.state.keys.map(key => {
  //           obj[key]
  //             ? obj[key].push({ value: this.props.view.signal(key), xCount: this.state.xCount })
  //             : (obj[key] = [{ value: this.props.view.signal(key), xCount: this.state.xCount }]);
  //         });
  //         this.props.setSignals(obj);
  //         this.setState({
  //           xCount: this.state.xCount + 1,
  //         });
  //       }
  //     );
  //   }
  // }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.forceUpdate();
    });
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
    this.getSignals(key);
  };

  public render() {
    const maxLengthArray = [...Array(this.state.xCount)].map((u, i) => i);
    const colorObj = {};
    if (!deepEqual(this.state.signal, {})) {
      Object.keys(this.props.signals).map(key => {
        if (
          key === 'width' ||
          key === 'height' ||
          key === 'padding' ||
          key === 'autosize' ||
          key === 'cursor' ||
          key === 'xCount'
        ) {
          return;
        }
        if (!deepEqual(this.state.signal, {})) {
          const index = getClosestValue(this.props.signals[key], this.state.signal.timeStamp, key);
          colorObj[key] = index;
        }
      });
    }
    return (
      <>
        <div style={{ position: 'absolute', top: '50%', right: 100 }}>
          {this.state.isHovered && <div>{stringify(this.state.hoverValue)}</div>}
        </div>
        <table className="debugger-table">
          {Object.keys(this.props.signals).map((k, index) => {
            if (
              k === 'width' ||
              k === 'height' ||
              k === 'padding' ||
              k === 'autosize' ||
              k === 'cursor' ||
              k === 'xCount'
            ) {
              return null;
            }
            return (
              <tr>
                <td style={{ width: 100 }}>{k}</td>
                <td>
                  <div id={`timeline${index}`}>
                    <TimelineRow data={this.props.signals[k]} id={index} />
                    {/* <br></br> */}
                    {/* <svg className="debugger" style={{ width: '100%', height: '20' }}>
                      <g>
                        {maxLengthArray.map((e, index) => {
                          {
                            return this.props.signals[k].map(signal => {
                              if (signal.xCount === index) {
                                return (
                                  <rect
                                    className="svg-rect"
                                    onMouseOver={() => this.setState({ isHovered: true, hoverValue: { [k]: e } })}
                                    onMouseOut={() => this.setState({ isHovered: false, hoverValue: {} })}
                                    width={(window.innerWidth * 0.4) / this.state.xCount}
                                    x={(index * window.innerWidth * 0.4) / this.state.xCount}
                                    height="20"
                                    style={{
                                      cursor: 'pointer',
                                      fill: '#b7b7b7',
                                      stroke: 'white',
                                      strokeWidth: '0.5px',
                                      pointerEvents: 'all',
                                    }}
                                  >
                                    {stringify(e)}
                                  </rect>
                                );
                              } else {
                                return null;
                              }
                            });
                          }
                        })}
                      </g>
                    </svg> */}
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
