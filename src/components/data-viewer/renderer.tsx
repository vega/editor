import './index.css';

import * as React from 'react';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import * as vega from 'vega';
import { stringify } from 'vega-tooltip';
import { isObject } from 'vega-util';
import { View } from '../../constants';

interface Props {
  editorString: string;
  view: View;
}

interface State {
  currentPage: number;
  options: string[];
  pageCount: number;
  selectedData: string;
  table: string;
}

const OPTIONS = {
  maxDepth: 2,
  perPage: 100,
};

export default class ErrorPane extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      options: [],
      pageCount: 1,
      selectedData: '',
      table: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.formatData = this.formatData.bind(this);
  }
  public escapeHTML(data: string) {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  public handleChange(option) {
    this.setState({ selectedData: option.value, currentPage: 0 });
  }
  public handlePageChange(option) {
    const selected = option.selected;
    this.setState({ currentPage: selected });
  }
  public getDataList() {
    return Object.keys(this.props.view.getState({ data: vega.truthy, signals: vega.falsy, recurse: true }).data);
  }
  public getData(name: string) {
    const data = new Promise(resolve => {
      setTimeout(() => {
        resolve(this.props.view.data(name));
      }, 200);
    });
    return data;
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
  public async renderViewer() {
    const options = [];
    const dataList = this.getDataList();
    dataList.push(dataList.shift());
    dataList.map(key => {
      options.push({
        label: key,
        value: key,
      });
    });
    if (this.state.selectedData && dataList.includes(this.state.selectedData)) {
      const data = (await this.getData(this.state.selectedData)) as any;
      if (!data || !dataList) {
        return;
      }
      const pageCount = Math.ceil(data.length / OPTIONS.perPage);
      const table = this.generateTable(this.formatData(data));
      this.setState({
        options,
        pageCount,
        table,
      });
    } else {
      this.setState({ selectedData: options[0].label });
    }
  }
  public generateTable(data: any) {
    if (isObject(data)) {
      data = Object.values(data);
    }
    if (data.length === 0) {
      return;
    }
    let table = '<table><tr>';
    // Creating table header using first object
    Object.keys(data[0]).map(key => {
      table += `<th>${key}</th>`;
    });
    table += '</tr>';
    // Content of table
    const content = Object.values(data);
    const start = OPTIONS.perPage * this.state.currentPage;
    const end = start + OPTIONS.perPage;
    content.slice(start, end).map(key => {
      table += '<tr>';
      Object.values(key).map(value => {
        // Replacing large data with (...)
        // Width of table cell / average width of a char i.e 8px
        if (value && value.length > 24) {
          value = this.escapeHTML(value);
          table += `<td class="tooltip" data-tip="The field is too large to be displayed. Please use the view API (see JS console)."><span>(...)<span></td>`;
        } else {
          table += `<td>${value}</td>`;
        }
      });
      table += '</tr>';
    });
    table += '</table>';

    return table;
  }
  public componentDidMount() {
    this.renderViewer();
  }
  public componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.editorString !== this.props.editorString ||
      prevState.selectedData !== this.state.selectedData ||
      prevState.currentPage !== this.state.currentPage
    ) {
      this.renderViewer();
    }
  }
  public render() {
    let select;
    let pagination;
    if (this.state.options.length !== 0) {
      select = (
        <Select
          style={{ width: `${8 * this.state.selectedData.length + 100}px` }}
          className="data-dropdown"
          value={{ label: this.state.selectedData }}
          onChange={this.handleChange}
          options={this.state.options}
          clearable={false}
          searchable={false}
        />
      );
    }
    if (this.state.pageCount > 1) {
      pagination = (
        <ReactPaginate
          previousLabel={'<'}
          nextLabel={'>'}
          breakClassName={'break'}
          pageCount={this.state.pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={this.handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
        />
      );
    }
    return (
      <div className="data-viewer">
        <div className="data-viewer-header">
          {select}
          {pagination}
        </div>
        <div className="data-table" dangerouslySetInnerHTML={{ __html: this.state.table }} />
      </div>
    );
  }
}
