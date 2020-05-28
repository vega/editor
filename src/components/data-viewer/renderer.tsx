import * as React from 'react';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import * as vega from 'vega';
import {debounce} from 'vega';
import {mapStateToProps} from '.';
import ErrorBoundary from '../error-boundary';
import Table from '../table';
import './index.css';

type StoreProps = ReturnType<typeof mapStateToProps>;

interface OwnComponentProps {
  onClickHandler: (header: string) => void;
}

type Props = StoreProps & OwnComponentProps;

const initialState = {
  currentPage: 0,
  selectedData: '',
};

type State = Readonly<typeof initialState>;

const ROWS_PER_PAGE = 50;

export default class DataViewer extends React.PureComponent<Props, State> {
  public readonly state: State = initialState;

  private debouncedDataChanged: () => void;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.debouncedDataChanged = debounce(100, () => {
      this.forceUpdate();
    });
  }

  public handleChange(option) {
    this.setState({selectedData: option.value, currentPage: 0});
  }

  public handlePageChange(option) {
    const selected = option.selected;
    this.setState({currentPage: selected});
  }

  public getDatasets() {
    return Object.keys(
      this.props.view.getState({
        data: vega.truthy,
        signals: vega.falsy,
        recurse: true,
      }).data
    );
  }

  public setDefaultDataset() {
    const datasets = this.getDatasets();

    if (datasets.length) {
      this.setState({
        currentPage: 0,
        selectedData: datasets[datasets.length > 1 ? 1 : 0],
      });
    }
  }

  public componentDidMount() {
    this.setDefaultDataset();
  }

  public componentWillUnmount() {
    if (this.state.selectedData) {
      this.props.view.removeDataListener(this.state.selectedData, this.debouncedDataChanged);
    }
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.props.view !== prevProps.view) {
      const datasets = this.getDatasets();

      if (datasets.indexOf(this.state.selectedData) === -1) {
        // the new view has different dataset so let's reset everything
        this.setState(initialState);
      } else {
        // the new view has the same dataset so let's not change the state but add a new listener
        this.props.view.addDataListener(this.state.selectedData, this.debouncedDataChanged);
      }
      return;
    }

    if (this.state.selectedData === '') {
      this.setDefaultDataset();
    } else if (this.state.selectedData !== prevState.selectedData) {
      if (prevState.selectedData) {
        this.props.view.removeDataListener(prevState.selectedData, this.debouncedDataChanged);
      }

      this.props.view.addDataListener(this.state.selectedData, this.debouncedDataChanged);
    }
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

    let pagination: ReactPaginate;

    const data = this.props.view.data(selected) || [];

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
      <Table
        onClickHandler={(header) => this.props.onClickHandler(header)}
        header={Object.keys(data[0])}
        data={visibleData}
      />
    ) : (
      <span className="error">The table is empty.</span>
    );

    return (
      <>
        <div className="data-viewer-header">
          <Select
            className="data-dropdown"
            value={{label: selected}}
            onChange={this.handleChange}
            options={datasets.map((d) => ({
              label: d,
              value: d,
            }))}
            clearable={false}
            searchable={true}
          />
          <div className="pagination-wrapper">{pagination}</div>
        </div>
        <div className="data-table">
          <ErrorBoundary>{table}</ErrorBoundary>
        </div>
      </>
    );
  }
}
