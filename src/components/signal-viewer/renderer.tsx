import stringify from 'json-stringify-pretty-compact';
import React from 'react';
import * as vega from 'vega';
import { deepEqual } from 'vega-lite/build/src/util';
import { mapDispatchToProps, mapStateToProps } from '.';
import './index.css';
import SignalRow from './signalRow';
import TimelineRow from './TimelineRow';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

function getClosestValue(signalArray, xCount, key) {
  // console.log({ signalArray, xCount });
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
    };
  }

  public getKeys(ref = this.props) {
    return Object.keys(ref.view.getState({ data: vega.truthy, signals: vega.truthy, recurse: true }).signals);
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

  public onClickInit(key, hoverValue) {
    this.setState({ maskListner: true });
    this.onHoverInit(key, hoverValue, true);

    setImmediate(() => this.setState({ maskListner: false }));
  }

  public componentWillReceiveProps(nextProps) {
    if (this.props.view !== nextProps.view) {
      const keys = this.getKeys(nextProps);
      this.setState(
        {
          keys,
          signal: {},
          xCount: 0,
        },
        () => {
          const obj = {};
          this.state.keys.map(key => {
            obj[key]
              ? obj[key].push({ value: this.props.view.signal(key), xCount: this.state.xCount })
              : (obj[key] = [{ value: this.props.view.signal(key), xCount: this.state.xCount }]);
          });
          this.props.setSignals(obj);
          this.setState({
            xCount: 1,
          });
        }
      );
    }
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
        isClicked: false,
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
          this.props.view.setState({ signals: hoverObj });
        }
      );
    }
  }

  public componentDidMount() {
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

  public valueChange = (key: string, value: any) => {
    this.getSignals(key);

    this.setState({
      countSignal: {},
      hoverValue: {},
      isClicked: false,
      isHovered: false,
      signal: {},
    });
  };

  public render() {
    return (
      <>
        <table className="debugger-table"></table>
        <div className="signal-viewer">
          <table className="editor-table">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Timeline</th>
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
                  >
                    <>
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
                        width={window.innerWidth * 0.4}
                        xCount={this.state.xCount}
                      />
                    </>
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
