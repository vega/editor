import './index.css';

import * as React from 'react';
import { RefreshCw } from 'react-feather';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import * as vega from 'vega';
import { View } from '../../constants';
import ErrorBoundary from '../error-boundary';
import Table from '../table';

interface Props {
  view?: View;
  debugPane: boolean;
}

const initialState = {
  currentPage: 0,
  selectedData: '',
};

type State = Readonly<typeof initialState>;

const ROWS_PER_PAGE = 50;

export default class DataViewer extends React.Component<Props, State> {
  public readonly state: State = initialState;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  public handleChange(option) {
    this.setState({ selectedData: option.value, currentPage: 0 });
  }

  public handlePageChange(option) {
    const selected = option.selected;
    this.setState({ currentPage: selected });
  }

  public handleReload() {
    this.forceUpdate();
  }

  public getDatasets() {
    return Object.keys(this.props.view.getState({ data: vega.truthy, signals: vega.falsy, recurse: true }).data);
  }

  public render() {
    const datasets = this.getDatasets();
    if (datasets.length === 0) {
      return <div className="data-viewer">Spec has no data</div>;
    }

    datasets.push(datasets.shift()); // Move root to the end

    let selected = this.state.selectedData;
    if (datasets.indexOf(selected) < 0) {
      selected = datasets[0];
    }

    let pagination;

    const data = this.props.view.data(selected) || [];

    if (this.props.debugPane) {
      this.props.view.addDataListener(selected, () => {
        this.forceUpdate();
      });
    }

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

    const table = data.length ? (
      <Table header={Object.keys(data[0])} data={visibleData} />
    ) : (
      <span className="error">The table is empty.</span>
    );

    return (
      <div className="data-viewer">
        <div className="data-viewer-header">
          <Select
            className="data-dropdown"
            value={{ label: selected }}
            onChange={this.handleChange}
            options={datasets.map(d => ({
              label: d,
              value: d,
            }))}
            clearable={false}
            searchable={false}
          />
          <div className="pagination-wrapper">{pagination}</div>
        </div>
        <ErrorBoundary>{table}</ErrorBoundary>
      </div>
    );
  }
}
