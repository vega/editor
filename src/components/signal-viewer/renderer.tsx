import React from 'react';
import * as vega from 'vega';
import {mapDispatchToProps, mapStateToProps} from '.';
import './index.css';
// var equalCycles = require('fast-deep-equal');
import SignalRow from './signalRow';
import TimelineRow from './TimelineRow';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

function isEqual(a, b) {
  const stack = [];
  function _isEqual(a, b) {
    // console.log("->", stack.length);
    // handle some simple cases first
    if (a === b) {
      return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object') {
      return false;
    }
    // XXX: typeof(null) === "object", but Object.getPrototypeOf(null) throws!
    if (a === null || b === null) {
      return false;
    }
    const proto = Object.getPrototypeOf(a);
    if (proto !== Object.getPrototypeOf(b)) {
      return false;
    }
    // assume that non-identical objects of unrecognized type are not equal
    // XXX: could add code here to properly compare e.g. Date objects
    if (proto !== Object.prototype && proto !== Array.prototype) {
      return false;
    }

    // check the stack before doing a recursive comparison
    for (let i = 0; i < stack.length; i++) {
      if (a === stack[i][0] && b === stack[i][1]) {
        return true;
      }
      // if (b === stack[i][0] && a === stack[i][1]) return true;
    }

    // do the objects even have the same keys?
    for (const prop in a) {
      if (!(prop in b)) {
        return false;
      }
    }
    for (const prop in b) {
      if (!(prop in a)) {
        return false;
      }
    }

    // nothing to do but recurse!
    stack.push([a, b]);
    for (const prop in a) {
      if (!_isEqual(a[prop], b[prop])) {
        stack.pop();
        return false;
      }
    }
    stack.pop();
    return true;
  }
  return _isEqual(a, b);
}

export default class SignalViewer extends React.PureComponent<Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      countSignal: {},
      hoverValue: {},
      isClicked: false,
      isHovered: false,
      keys: [],
      maskListner: false,
      maxLength: 0,
      signal: {},
      xCount: 0,
      timeline: false,
    };
  }

  public getKeys(ref = this.props) {
    return Object.keys(
      ref.view.getState({
        data: vega.truthy,
        signals: vega.truthy,
        recurse: true,
      }).signals
    );
  }

  public getSignals(changeKey = null) {
    if (!this.state.timeline) {
      return;
    }
    if (changeKey) {
      const obj = {
        value: this.props.view.signal(changeKey),
      };
      const lastObj = this.props.signals[changeKey];
      const prevObj = {...lastObj[lastObj && lastObj.length - 1]};
      delete prevObj.xCount;
      // if (equalCycles(obj, prevObj)) {
      (obj as any).xCount = this.state.xCount;
      const newSignals = this.props.signals[changeKey].concat(obj);
      this.props.setSignals({...this.props.signals, [changeKey]: newSignals});
      this.setState(current => {
        return {
          ...current,
          xCount: current.xCount + 1,
        };
      });
      // }
    } else {
      const obj = {};
      this.state.keys.map(key => {
        obj[key]
          ? obj[key].push({
              value: this.props.view.signal(key),
              xCount: this.state.xCount,
            })
          : (obj[key] = [{value: this.props.view.signal(key), xCount: this.state.xCount}]);
      });
      this.props.setSignals(obj);
      this.setState({
        xCount: this.state.xCount + 1,
      });
    }
  }

  public onClickInit(key, hoverValue) {
    this.setState({maskListner: true});
    const overlay: HTMLElement = document.querySelector('.overlay');
    overlay.style.display = 'block';
    this.onHoverInit(key, hoverValue, true); // hover calculation with persist
  }

  public componentWillReceiveProps(nextProps) {
    if (this.props.view !== nextProps.view) {
      const keys = this.getKeys(nextProps);
      this.setState(
        {
          keys,
          signal: {},
          xCount: 0,
          timeline: false,
          isHovered: false,
          isClicked: false,
          hoverValue: {},
          countSignal: {},
          maskListner: false,
        },
        () => {
          const overlay: HTMLElement = document.querySelector('.overlay');
          // remove the overlay
          overlay.style.display = 'none';
          if (this.state.timeline) {
            const obj = {};
            this.state.keys.map(key => {
              obj[key]
                ? obj[key].push({
                    value: this.props.view.signal(key),
                    xCount: this.state.xCount,
                  })
                : (obj[key] = [
                    {
                      value: this.props.view.signal(key),
                      xCount: this.state.xCount,
                    },
                  ]);
            });

            this.props.setSignals(obj);
            this.setState({
              xCount: 1,
            });
          }
        }
      );
    }
  }

  public resetTimeline() {
    // get the chart
    const overlay: HTMLElement = document.querySelector('.overlay');
    // remove the overlay
    overlay.style.display = 'none';
    // setState to current value
    const currentValueObj = {};
    this.state.keys.map(signal => {
      currentValueObj[signal] = this.props.signals[signal][this.props.signals[signal].length - 1].value;
    });
    this.props.view.setState({signals: currentValueObj});
    // remove isClicked, isHovered, hoverValue, signal and CountValue
    this.setState(
      {
        isClicked: false,
        signal: {},
        countSignal: {},
        hoverValue: {},
        isHovered: false,
      },
      () => {
        setImmediate(() =>
          this.setState({
            maskListner: false,
          })
        );
      }
    );
    // remove the maskListner
  }

  public onHoverInit(signalKey, hoverValue, shouldPersist = false) {
    const hoverObj = {
      [signalKey]: hoverValue.value,
    };
    const countObj = {
      [signalKey]: hoverValue.xCount,
    };
    Object.keys(this.props.signals).map(key => {
      let i = 0;
      while (this.props.signals[key][i] && this.props.signals[key][i].xCount <= hoverValue.xCount) {
        i++;
      }
      --i;
      hoverObj[key] = this.props.signals[key][i].value;
      countObj[key] = this.props.signals[key][i].xCount;
    });
    if (!shouldPersist) {
      this.setState({
        hoverValue: hoverObj,
        isHovered: true,
      });
    } else {
      this.setState(
        {
          countSignal: countObj,
          hoverValue: {},
          isClicked: true,
          isHovered: false,
          signal: hoverObj,
        },
        () => {
          this.props.view.setState({signals: hoverObj});
        }
      );
    }
  }

  public componentDidMount() {
    window.addEventListener('resize', () => {
      this.forceUpdate();
    });
    const keys = this.getKeys();
    this.setState({
      keys,
    });
  }
  public valueChange = (key: string, value: any) => {
    if (this.state.timeline && !this.state.maskListner) {
      this.getSignals(key);
    }
  };

  public render() {
    return (
      <>
        <div style={{display: 'inline-block'}}>
          <button
            className="sharing-button"
            style={{backgroundColor: this.state.timeline ? 'red' : '', margin: '7px 10px'}}
            onClick={() => {
              this.setState(
                {
                  timeline: !this.state.timeline,
                  xCount: 0,
                },
                () => {
                  this.props.setSignals({});
                  this.getSignals();
                  if (!this.state.timeline) {
                    this.resetTimeline();
                  }
                }
              );
            }}
          >
            {this.state.timeline ? 'Stop Recording' : 'Record signal changes'}
          </button>
          {this.state.timeline && !this.state.maskListner && this.state.xCount > 1 && (
            <button
              className="sharing-button"
              style={{margin: '7px 10px'}}
              onClick={() => {
                this.setState(
                  {
                    xCount: 0,
                  },
                  () => {
                    this.props.setSignals({});
                    this.getSignals();
                  }
                );
              }}
            >
              Clear Timeline
            </button>
          )}
          {this.state.maskListner && this.state.timeline && (
            <button className="sharing-button" style={{margin: '7px 10px'}} onClick={() => this.resetTimeline()}>
              Continue Recording
            </button>
          )}
        </div>

        <table className="debugger-table" />
        <div className="signal-viewer">
          <table className="editor-table">
            <thead>
              <tr>
                <th>Signal</th>
                {this.state.timeline && <th>Timeline</th>}
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {this.state.keys.map(signal => {
                return (
                  <SignalRow
                    isHovered={this.state.isHovered}
                    isClicked={this.state.isClicked}
                    clickedSignal={this.state.signal[signal]}
                    hoverValue={this.state.hoverValue[signal]}
                    maskListner={this.state.maskListner}
                    onValueChange={(key, value) => this.valueChange(key, value)}
                    key={signal}
                    signal={signal}
                    view={this.props.view}
                    timeline={this.state.timeline}
                  >
                    {this.state.timeline && (
                      <TimelineRow
                        onHoverInit={hoverValue => this.onHoverInit(signal, hoverValue)}
                        onClickInit={hoverValue => this.onClickInit(signal, hoverValue)}
                        onHoverEnd={() => {
                          this.setState({
                            hoverValue: {},
                            isHovered: false,
                          });
                        }}
                        isClicked={this.state.isClicked}
                        clickedValue={this.state.countSignal[signal]}
                        data={this.props.signals[signal]}
                        width={window.innerWidth * 0.3}
                        xCount={this.state.xCount}
                      />
                    )}
                  </SignalRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}
