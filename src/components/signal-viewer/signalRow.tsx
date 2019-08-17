import React from 'react';
import { isDate } from 'vega';
import { View } from '../../constants';
import { formatValueLong } from '../table/renderer';
import stringify from 'json-stringify-pretty-compact';

interface Props {
  view: View;
  signal: string;
  onValueChange: (key, value) => void;
  maskListner: boolean;
  isHovered: boolean;
  isClicked: boolean;
  clickedSignal: any;
  hoverValue: any;
}

interface State {
  signalValue: string;
}

export default class SignalRow extends React.PureComponent<Props, State> {
  private listnerAttached = false;
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
    if (!this.props.maskListner) {
      this.props.view.addSignalListener(this.props.signal, this.signalHandler);
      this.listnerAttached = true;
    }
  }
  public componentWillUnmount() {
    this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
    this.listnerAttached = false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.maskListner && this.listnerAttached) {
      this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
      this.listnerAttached = false;
    } else if (!this.listnerAttached && !nextProps.maskListner) {
      this.props.view.addSignalListener(this.props.signal, this.signalHandler);
      this.listnerAttached = true;
    }
  }

  renderSignal = () => {
    const { isClicked, isHovered, clickedSignal, hoverValue } = this.props;
    if (isClicked && clickedSignal !== undefined) {
      return stringify(clickedSignal);
    } else if (isHovered && hoverValue !== undefined) {
      return stringify(hoverValue);
    } else {
      return null;
    }
  };
  public render() {
    let tooLong = false;
    let formatted = '';
    if (!isDate(this.state.signalValue)) {
      const formatValue = formatValueLong(this.state.signalValue);
      if (formatValue !== undefined) {
        tooLong = formatValue.tooLong;
        formatted = formatValue.formatted;
      } else {
        tooLong = false;
        formatted = 'undefined';
      }
    } else {
      tooLong = false;
      formatted = new Date(this.state.signalValue).toUTCString();
    }
    if (tooLong) {
      return (
        <tr>
          <td>{this.props.signal}</td>
          <td title="The field is too large to be displayed. Please use the view API (see JS console).">
            <span>(...)</span>
          </td>
        </tr>
      );
    } else {
      const value = this.renderSignal();
      return (
        <tr style={{ backgroundColor: this.props.isHovered && this.props.hoverValue !== undefined ? '#fce57e' : '' }}>
          <td>{this.props.signal}</td>
          <td key={this.props.signal}>{value ? value : formatted}</td>
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
