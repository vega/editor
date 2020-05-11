import React from 'react';
import {Search} from 'react-feather';
import {isDate} from 'vega';
import {View} from '../../constants';
import {formatValueLong} from '../table/renderer';

interface Props {
  view: View;
  signal: string;
  onValueChange: (key, value) => void;
  maskListener: boolean;
  isHovered: boolean;
  isTimelineSelected: boolean;
  clickedSignal: any;
  hoverValue: any;
  timeline: boolean;
  onClickHandler?: (header: string) => void;
}

interface State {
  signalValue: string;
}

export default class SignalRow extends React.PureComponent<Props, State> {
  private listenerAttached = false;
  constructor(props) {
    super(props);
    this.state = {
      signalValue: this.props.view.signal(this.props.signal),
    };
    this.signalHandler = this.signalHandler.bind(this);
  }
  public componentDidUpdate(prevProps) {
    if (prevProps.view !== this.props.view) {
      prevProps.view.removeSignalListener(prevProps.signal, this.signalHandler);
      this.props.view.addSignalListener(this.props.signal, this.signalHandler);
      this.setState(
        {
          signalValue: this.props.view.signal(this.props.signal),
        },
        () => this.props.onValueChange(this.props.signal, this.props.view.signal(this.props.signal))
      );
    }
  }
  public componentDidMount() {
    if (!this.props.maskListener) {
      this.props.view.addSignalListener(this.props.signal, this.signalHandler);
      this.listenerAttached = true;
    }
  }
  public componentWillUnmount() {
    this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
    this.listenerAttached = false;
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.maskListener && this.listenerAttached) {
      this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
      this.listenerAttached = false;
    } else if (!this.listenerAttached && !nextProps.maskListener) {
      this.props.view.addSignalListener(this.props.signal, this.signalHandler);
      this.listenerAttached = true;
    }
  }

  public renderSignal = () => {
    const {isTimelineSelected, isHovered, clickedSignal, hoverValue} = this.props;
    if (isTimelineSelected && isHovered) {
      return hoverValue;
    }
    if (isTimelineSelected) {
      return clickedSignal;
    } else if (isHovered) {
      return hoverValue;
    } else {
      return null;
    }
  };

  public getBackgroundColor = () => {
    if (this.props.isTimelineSelected && this.props.isHovered) {
      return '#fce57e';
    }
    if (this.props.isTimelineSelected && this.props.clickedSignal !== undefined) {
      return '#A4F9C8';
    } else if (this.props.isHovered && this.props.hoverValue !== undefined) {
      return '#fce57e';
    } else {
      return '';
    }
  };

  public render() {
    let tooLong = false;
    let formatted = '';
    const value = this.renderSignal();
    if (!isDate(this.state.signalValue)) {
      const formatValue = formatValueLong(value ? value : this.state.signalValue);
      if (formatValue !== undefined) {
        tooLong = formatValue.tooLong;
        formatted = formatValue.formatted;
      } else {
        tooLong = false;
        formatted = 'undefined';
      }
    } else {
      tooLong = false;
      formatted = new Date(value ? value : this.state.signalValue).toUTCString();
    }
    if (tooLong) {
      return (
        <tr>
          <td
            className="pointer"
            onClick={() => this.props.onClickHandler && this.props.onClickHandler(this.props.signal)}
          >
            {this.props.signal}
            <Search />
          </td>
          {this.props.timeline && <td style={{padding: 0}}>{this.props.children}</td>}
          <td
            style={{backgroundColor: this.getBackgroundColor()}}
            key={this.props.signal}
            title="The field is too large to be displayed. Please use the view API (see JS console)."
          >
            <span>(...)</span>
          </td>
        </tr>
      );
    } else {
      return (
        <tr>
          <td
            style={{whiteSpace: 'nowrap'}}
            className="pointer"
            onClick={() => this.props.onClickHandler && this.props.onClickHandler(this.props.signal)}
          >
            {this.props.signal}
            <Search />
          </td>
          {this.props.timeline && <td style={{padding: 0}}>{this.props.children}</td>}
          <td
            style={{
              whiteSpace: 'nowrap',
              backgroundColor: this.getBackgroundColor(),
            }}
            key={this.props.signal}
          >
            {formatted}
          </td>
        </tr>
      );
    }
  }

  private signalHandler(signalName: string, currentValue) {
    this.setState(
      {
        signalValue: currentValue,
      },
      () => {
        this.props.onValueChange(this.props.signal, currentValue);
      }
    );
  }
}
