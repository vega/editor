import React from 'react';
import { isArray, isObject, isString } from 'vega';
import { View } from '../../constants';

const MAX_LENGTH = 120;
interface Props {
  view: View;
  signal: string;
}

export default class SignalRow extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.signalHandle = this.signalHandle.bind(this);
  }
  public componentDidUpdate(prevProps) {
    if (prevProps.view !== this.props.view) {
      prevProps.view.removeSignalListener(prevProps.signal, this.signalHandle);
      this.props.view.addSignalListener(this.props.signal, this.signalHandle);
    }
  }
  public signalHandle() {
    this.forceUpdate();
  }
  public componentDidMount() {
    this.props.view.addSignalListener(this.props.signal, this.signalHandle);
  }
  public componentWillUnmount() {
    this.props.view.removeSignalListener(this.props.signal, this.signalHandle);
  }
  public render() {
    const value = formatValueLong(this.props.view.signal(this.props.signal));
    const returnValue = value.returnValue;
    const tooLong = value.tooLong;
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
          <td key={this.props.signal}>{returnValue}</td>
        </tr>
      );
    }
  }
}

function formatValueLong(signalValue) {
  let returnValue = '';
  let tooLong = false;
  if (isArray(signalValue)) {
    returnValue = `[${signalValue.map(value => (isString(value) ? value : JSON.stringify(value))).join(', ')}]`;
    tooLong = returnValue.length > MAX_LENGTH;
  } else if (isObject(signalValue)) {
    Object.keys(signalValue).map(key => {
      if (isArray(signalValue[key])) {
        let objValue = '';
        signalValue[key].map(obj => {
          Object.keys(obj).map(objKey => {
            objValue += `(${key}: ${obj[objKey]})`;
          });
        });
        returnValue += `${key}: ${objValue}`;
      } else {
        returnValue += `${key}: ${signalValue[key]}, `;
      }
    });
    returnValue = returnValue.slice(0, returnValue.length - 2);
    tooLong = returnValue.length > MAX_LENGTH;
  } else if (signalValue === null || signalValue === undefined) {
    returnValue = signalValue;
    tooLong = false;
  } else {
    returnValue = signalValue.toString();
    tooLong = returnValue.length > MAX_LENGTH;
  }
  return {
    returnValue,
    tooLong,
  };
}
