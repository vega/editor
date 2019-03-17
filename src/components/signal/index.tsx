import React from 'react';
import { View } from '../../constants';

interface Props {
  view: View;
  signal: any;
}

interface State {
  signalValue: string;
}

export default class SignalRow extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      signalValue: this.getValue(this.props.signal),
    };
    this.getValue = this.getValue.bind(this);
  }
  public componentDidMount() {
    this.props.view.addSignalListener(this.props.signal, () => {
      this.setState({
        signalValue: this.getValue(this.props.signal),
      });
    });
  }
  public componentWillUnmount() {
    this.props.view.removeSignalListener(this.props.signal, () => {
      // Do nothing
    });
  }
  public getValue(signalKey) {
    let returnValue = '';
    const currentValue = this.props.view.signal(signalKey);
    if (typeof currentValue === 'object') {
      Object.keys(currentValue).map(value => {
        returnValue += `${value}: ${currentValue[value]}, `;
      });
      return returnValue.slice(0, returnValue.length - 2);
    }
    return currentValue;
  }
  public render() {
    return (
      <tr>
        <td>{this.props.signal}</td>
        <td>{this.state.signalValue}</td>
      </tr>
    );
  }
}
