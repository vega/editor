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
      hoverValue: {},
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

  public valueChange = (key, value) => {
    if (key === 'width' || key === 'height' || key === 'padding' || key === 'autosize' || key === 'cursor') {
      return;
    }
    this.getSignals(key);
  };

  public render() {
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
              <tr key={k}>
                <td style={{ width: 100 }}>{k}</td>
                <td>
                  // TODO: set width correctly
                  <TimelineRow data={this.props.signals[k]} width={500} xCount={this.state.xCount} />
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
