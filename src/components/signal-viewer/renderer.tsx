import React from 'react';
import * as vega from 'vega';

import { View } from '../../constants';
import Table from '../table';

import './index.css';

const key = '_signals';
const header = ['Signal', 'Value'];

interface Props {
  view?: View;
  debugPane: boolean;
}

export default class SignalViewer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }
  public componentDidMount() {
    Object.keys(this.props.view[key]).map(signal => {
      this.props.view.addSignalListener(signal, () => {
        this.forceUpdate();
      });
    });
  }
  public componentWillUnmount() {
    Object.keys(this.props.view[key]).map(signal => {
      this.props.view.removeSignalListener(signal, () => {
        // Do nothing
      });
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
  public getData() {
    let values = [];
    Object.keys(this.props.view[key]).map((signal, id) => {
      values = [
        ...values,
        {
          id,
          [header[0]]: signal,
          [header[1]]: this.getValue.bind(this)(signal),
        },
      ];
    });
    return values;
  }
  public render() {
    const data = this.getData.bind(this)();
    return (
      <div className="signal-viewer">
        <Table header={header} data={data} />
      </div>
    );
  }
}
