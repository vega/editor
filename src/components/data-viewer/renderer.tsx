import './index.css';

import * as React from 'react';
import Select from 'react-select';
import * as vega from 'vega';
import { stringify } from 'vega-tooltip';
import { isObject } from 'vega-util';
import { View } from '../../constants';

interface Props {
  view: View;
}

interface State {
  selectedData: string;
}

const OPTIONS = {
  maxDepth: 2,
};

export default class ErrorPane extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dataSets: null,
      selectedData: 'root',
    };
    this.handleChange = this.handleChange.bind(this);
    this.formatData = this.formatData.bind(this);
  }
  public handleChange(option) {
    this.setState({ selectedData: option.value });
  }
  public getDataList() {
    return Object.keys(this.props.view.getState({ data: vega.truthy, signals: vega.falsy, recurse: true }).data);
  }
  public getData(name: string) {
    return this.props.view.data(name);
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
        // Width of table cell / average width of a char i.e 8px
        if (value && value.length > 24) {
          value = this.escapeHTML(value);
          table += `<td data-tip="${value}">(...)</td>`;
        } else {
          table += `<td>${value}</td>`;
        }
      });
      table += '</tr>';
    });
    table += '</table>';
    return table;
  }
  public escapeHTML(data: string) {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  public render() {
    let table;
    let select;
    const options = [];
    const dataList = this.getDataList();
    if (dataList) {
      dataList.map(key => {
        options.push({
          label: key,
          value: key,
        });
      });
      select = (
        <Select
          className="data-dropdown"
          value={{ label: this.state.selectedData }}
          onChange={this.handleChange}
          options={options}
          clearable={false}
          searchable={false}
        />
      );
      if (dataList.includes(this.state.selectedData)) {
        const data = this.getData(this.state.selectedData);
        if (data) {
          table = this.generateTable(this.formatData(data));
        }
      } else {
        this.setState({ selectedData: 'root' });
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
