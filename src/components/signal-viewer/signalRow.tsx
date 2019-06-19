import React from 'react';
import { isDate } from 'vega';
import { View } from '../../constants';
import { formatValueLong } from '../table/renderer';

interface Props {
  view: View;
  signal: string;
}

interface State {
  signalValue: string;
}

export default class SignalRow extends React.PureComponent<Props, State> {
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
      this.setState({
        signalValue: this.props.view.signal(this.props.signal),
      });
    }
  }
  public componentDidMount() {
    this.props.view.addSignalListener(this.props.signal, this.signalHandler);
  }
  public componentWillUnmount() {
    this.props.view.removeSignalListener(this.props.signal, this.signalHandler);
  }
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
      return (
        <tr>
          <td>{this.props.signal}</td>
          <td key={this.props.signal}>{formatted}</td>
        </tr>
      );
    }
  }

  private signalHandler(signalName: string, currentValue) {
    this.setState({
      signalValue: currentValue,
    });
  }
}
