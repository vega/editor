import React from 'react';
import * as vega from 'vega';
import {mapDispatchToProps, mapStateToProps} from '.';
import './index.css';
import SignalRow from './signalRow';
import TimelineRow from './TimelineRow';

type StoreProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

interface OwnComponentProps {
  onClickHandler: (header: string) => void;
}

type Props = StoreProps & OwnComponentProps;

export default class SignalViewer extends React.PureComponent<Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      countSignal: {},
      hoverValue: {},
      isTimelineSelected: false,
      isHovered: false,
      keys: [],
      maskListener: false,
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

  public getSignals(changedSignal = null) {
    if (!this.state.timeline) {
      return;
    }
    if (changedSignal) {
      const obj = {
        value: this.props.view.signal(changedSignal),
      };
      const lastObj = this.props.signals[changedSignal];
      const prevObj = {...lastObj[lastObj && lastObj.length - 1]};
      delete prevObj.xCount;
      (obj as any).xCount = this.state.xCount;
      const newSignals = this.props.signals[changedSignal].concat(obj);
      this.props.setSignals({
        ...this.props.signals,
        [changedSignal]: newSignals,
      });
      this.setState((current) => {
        return {
          ...current,
          xCount: current.xCount + 1,
        };
      });
    } else {
      const obj = {};
      this.state.keys.map((key) => {
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
    this.setState({maskListener: true});
    const overlay: HTMLElement = document.querySelector('.chart-overlay');
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
          isTimelineSelected: false,
          hoverValue: {},
          countSignal: {},
          maskListener: false,
        },
        () => {
          const overlay: HTMLElement = document.querySelector('.chart-overlay');
          // remove the overlay
          overlay.style.display = 'none';
          if (this.state.timeline) {
            const obj = {};
            this.state.keys.map((key) => {
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
    const overlay: HTMLElement = document.querySelector('.chart-overlay');
    // remove the overlay
    overlay.style.display = 'none';
    // setState to current value
    const currentValueObj = {};
    this.state.keys.map((signal) => {
      currentValueObj[signal] = this.props.signals[signal][this.props.signals[signal].length - 1].value;
    });
    this.props.view.setState({signals: currentValueObj});
    // remove isTimelineSelected, isHovered, hoverValue, signal and CountValue
    this.setState(
      {
        isTimelineSelected: false,
        signal: {},
        countSignal: {},
        hoverValue: {},
        isHovered: false,
      },
      () => {
        setImmediate(() =>
          this.setState({
            // remove the maskListener
            maskListener: false,
          })
        );
      }
    );
  }

  public onHoverInit(signalKey, hoverValue, shouldPersist = false) {
    const hoverObj = {
      [signalKey]: hoverValue.value,
    };
    const countObj = {
      [signalKey]: hoverValue.xCount,
    };

    for (const key in this.props.signals) {
      let i = 0;
      while (this.props.signals[key][i] && this.props.signals[key][i].xCount <= hoverValue.xCount) {
        i++;
      }
      --i;
      hoverObj[key] = this.props.signals[key][i].value;
      countObj[key] = this.props.signals[key][i].xCount;
    }
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
          isTimelineSelected: true,
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
    if (this.state.timeline && !this.state.maskListener) {
      this.getSignals(key);
    }
  };

  public render() {
    return (
      <>
        <div className="timeline-control-buttons">
          <button
            style={{
              backgroundColor: this.state.timeline ? 'red' : '',
              color: this.state.timeline ? 'white' : 'black',
            }}
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
            {this.state.timeline ? 'Stop Recording & Reset' : 'Record signal changes'}
          </button>
          {this.state.timeline && !this.state.maskListener && this.state.xCount > 1 && (
            <button
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
          {this.state.maskListener && this.state.timeline && (
            <button onClick={() => this.resetTimeline()}>Continue Recording</button>
          )}
        </div>
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
              {this.state.keys.map((signal) => {
                return (
                  <SignalRow
                    isHovered={this.state.isHovered}
                    isTimelineSelected={this.state.isTimelineSelected}
                    clickedSignal={this.state.signal[signal]}
                    hoverValue={this.state.hoverValue[signal]}
                    maskListener={this.state.maskListener}
                    onValueChange={(key, value) => this.valueChange(key, value)}
                    key={signal}
                    signal={signal}
                    view={this.props.view}
                    timeline={this.state.timeline}
                    onClickHandler={this.props.onClickHandler}
                  >
                    {this.state.timeline && (
                      <TimelineRow
                        onHoverInit={(hoverValue) => this.onHoverInit(signal, hoverValue)}
                        onClickInit={(hoverValue) => this.onClickInit(signal, hoverValue)}
                        onHoverEnd={() => {
                          this.setState({
                            hoverValue: {},
                            isHovered: false,
                          });
                        }}
                        isTimelineSelected={this.state.isTimelineSelected}
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
