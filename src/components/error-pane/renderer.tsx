import './index.css';

import * as React from 'react';
import { X } from 'react-feather';
import Select from 'react-select';
import { stringify } from 'vega-tooltip';
import { isObject } from 'vega-util';

interface Props {
  dataSets;
  error;
  warningsLogger;

  showErrorPane: () => void;
}

interface State {
  dataName: string;
}

const OPTIONS = {
  maxDepth: 2,
};

export default class ErrorPane extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dataName: 'root', // Default value
    };
    this.handleChange = this.handleChange.bind(this);
    this.formatData = this.formatData.bind(this);
  }
  public handleChange(option) {
    this.setState({ dataName: option.value });
  }
  public formatData(data: any) {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      keys.map(id => {
        Object.keys(data[id]).map(key => {
          if (isObject(data[id][key])) {
            data[id][key] = stringify(data[id][key], OPTIONS.maxDepth);
          }
        });
      });
    }
    return data;
  }
  public generateTable(data: any) {
    if (isObject(data)) {
      data = Object.values(data);
    }
    if (data.length === 0) {
      return;
    }
    let table = '<table><tr>';
    Object.keys(data[0]).map(key => {
      table += `<th>${key}</th>`;
    });
    table += '</tr>';
    Object.values(data).map(key => {
      table += '<tr>';
      Object.values(key).map(value => {
        table += `<td>${value}</td>`;
      });
      table += '</tr>';
    });
    table += '</table>';
    return table;
  }
  public render() {
    const list = [];
    if (this.props.error) {
      list.push(
        <li key={0}>
          <span className="error">[Error] </span>
          {this.props.error}
        </li>
      );
    }
    this.props.warningsLogger.warns.forEach((warning, i) => {
      list.push(
        <li key={i + 1}>
          <span className="warning">[Warning] </span>
          {warning}
        </li>
      );
    });
    if (list.length === 0) {
      list.push(
        <li key={'no error'}>
          <span className="info">[Info] </span>
          No error or warnings
        </li>
      );
    }
    let table;
    let select;
    const options = [];
    if (this.props.dataSets) {
      Object.keys(this.props.dataSets).map(key => {
        options.push({
          label: key,
          value: key,
        });
      });
      select = (
        <Select
          className="data-dropdown"
          value={{ label: this.state.dataName }}
          onChange={this.handleChange}
          options={options}
          clearable={false}
          searchable={false}
        />
      );
      if (this.props.dataSets[this.state.dataName]) {
        const currDataSet = this.formatData(this.props.dataSets[this.state.dataName]);
        table = this.generateTable(currDataSet);
      }
    }
    return (
      <div className="error-pane">
        <span onClick={e => this.props.showErrorPane()} className="close">
          <X />
        </span>
        <ul>{list}</ul>
        {select ? select : ''}
        <div className="data-viewer" dangerouslySetInnerHTML={{ __html: table }} />
      </div>
    );
  }
}
