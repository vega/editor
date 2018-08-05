import * as React from 'react';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import * as vega from 'vega';
import { View } from '../../constants';
import Table from '../table';
import './index.css';

interface Props {
  editorString: string;
  view: View;
}

interface State {
  currentPage: number;
  options: Array<{ label: string; value: string }>;
  selectedData: string;
}

const ROWS_PER_PAGE = 10;

export default class DataViewer extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      options: [],
      selectedData: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  public handleChange(option) {
    this.setState({ selectedData: option.value, currentPage: 0 });
  }
  public handlePageChange(option) {
    const selected = option.selected;
    this.setState({ currentPage: selected });
  }
  public getDatasets() {
    return Object.keys(this.props.view.getState({ data: vega.truthy, signals: vega.falsy, recurse: true }).data);
  }

  public setDatasetOptionsInState() {
    const options = [];
    const dataList = this.getDatasets();
    dataList.push(dataList.shift()); // move root to the end
    dataList.map(key => {
      options.push({
        label: key,
        value: key,
      });
    });

    this.setState({ options });
  }

  public componentDidMount() {
    this.setDatasetOptionsInState();
  }
  public componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.editorString !== this.props.editorString ||
      prevState.selectedData !== this.state.selectedData ||
      prevState.currentPage !== this.state.currentPage
    ) {
      this.setDatasetOptionsInState();
    }
  }
  public render() {
    if (this.state.options.length === 0) {
      return <div>Spec has no data.</div>;
    }

    let pagination;

    const selectedData = this.state.selectedData || this.state.options[0].label;

    const data = this.props.view.data(selectedData);
    const pageCount = Math.ceil(data.length / ROWS_PER_PAGE);

    if (pageCount > 1) {
      pagination = (
        <ReactPaginate
          previousLabel={'<'}
          nextLabel={'>'}
          breakClassName={'break'}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={this.handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
        />
      );
    }

    const start = ROWS_PER_PAGE * this.state.currentPage;
    const end = start + ROWS_PER_PAGE;

    const visibleData = data.slice(start, end);

    const table = data.length ? <Table header={Object.keys(data[0])} data={visibleData} /> : <div>Empty table</div>;

    return (
      <div className="data-viewer">
        <div className="data-viewer-header">
          <div style={{ display: 'inline-block' }}>
            <Select
              className="data-dropdown"
              value={{ label: selectedData }}
              onChange={this.handleChange}
              options={this.state.options}
              clearable={false}
              searchable={false}
            />
          </div>
          {pagination}
        </div>
        {table}
      </div>
    );
  }
}
