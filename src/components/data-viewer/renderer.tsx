import './index.css';

import * as React from 'react';
import Select from 'react-select';
import { stringify } from 'vega-tooltip';
import { isObject } from 'vega-util';

interface Props {
  dataSets;
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
      <div className="data-viewer">
        {select ? select : ''}
        <div className="data-table" dangerouslySetInnerHTML={{ __html: table }} />
      </div>
    );
  }
}
