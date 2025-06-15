import * as React from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import * as vega from 'vega';
import {debounce} from 'vega';
import ErrorBoundary from '../error-boundary/index.js';
import Table from '../table/index.js';
import './index.css';
import {OwnComponentProps} from './index.js';

interface StoreProps {
  editorRef: any;
  view: any;
}

type Props = StoreProps & OwnComponentProps;

const ROWS_PER_PAGE = 50;

const DataViewer: React.FC<Props> = (props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedData, setSelectedData] = useState('');
  const debouncedDataChangedRef = useRef<(() => void) | null>(null);

  const getDatasets = useCallback(() => {
    return Object.keys(
      props.view.getState({
        data: vega.truthy,
        signals: vega.falsy,
        recurse: true,
      }).data,
    );
  }, [props.view]);

  const setDefaultDataset = useCallback(() => {
    const datasets = getDatasets();

    if (datasets.length) {
      setCurrentPage(0);
      setSelectedData(datasets[datasets.length > 1 ? 1 : 0]);
    }
  }, [getDatasets]);

  const handleChange = useCallback((option: {value: string; label: string}) => {
    setSelectedData(option.value);
    setCurrentPage(0);
  }, []);

  const handlePageChange = useCallback((option: {selected: number}) => {
    setCurrentPage(option.selected);
  }, []);

  useEffect(() => {
    debouncedDataChangedRef.current = debounce(100, () => {
      setCurrentPage((prev) => prev);
    });
  }, []);

  useEffect(() => {
    setDefaultDataset();
  }, [setDefaultDataset]);

  useEffect(() => {
    return () => {
      if (selectedData && debouncedDataChangedRef.current) {
        props.view.removeDataListener(selectedData, debouncedDataChangedRef.current);
      }
    };
  }, [selectedData, props.view]);

  useEffect(() => {
    const datasets = getDatasets();

    if (datasets.indexOf(selectedData) === -1) {
      setCurrentPage(0);
      setSelectedData('');
    } else if (selectedData && debouncedDataChangedRef.current) {
      props.view.addDataListener(selectedData, debouncedDataChangedRef.current);
    }
  }, [props.view, getDatasets, selectedData]);
  useEffect(() => {
    if (selectedData === '') {
      setDefaultDataset();
    } else if (selectedData && debouncedDataChangedRef.current) {
      props.view.addDataListener(selectedData, debouncedDataChangedRef.current);

      return () => {
        if (debouncedDataChangedRef.current) {
          props.view.removeDataListener(selectedData, debouncedDataChangedRef.current);
        }
      };
    }
  }, [selectedData, props.view, setDefaultDataset]);

  const datasets = useMemo(() => {
    const datasetList = getDatasets();
    if (datasetList.length === 0) {
      return [];
    }
    datasetList.push(datasetList.shift());
    return datasetList;
  }, [getDatasets]);

  const selected = useMemo(() => {
    if (datasets.indexOf(selectedData) < 0) {
      return datasets[0] || '';
    }
    return selectedData;
  }, [datasets, selectedData]);

  const data = useMemo(() => {
    return props.view.data(selected) || [];
  }, [props.view, selected]);

  const pageCount = useMemo(() => {
    return Math.ceil(data.length / ROWS_PER_PAGE);
  }, [data.length]);

  const visibleData = useMemo(() => {
    const start = ROWS_PER_PAGE * currentPage;
    const end = start + ROWS_PER_PAGE;
    return data.slice(start, end);
  }, [data, currentPage]);

  const pagination = useMemo(() => {
    if (pageCount > 1) {
      return (
        <ReactPaginate
          previousLabel={'<'}
          nextLabel={'>'}
          breakClassName={'break'}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
        />
      );
    }
    return null;
  }, [pageCount, handlePageChange]);

  const table = useMemo(() => {
    if (data.length) {
      return (
        <Table
          onClickHandler={(header) => props.onClickHandler(header)}
          header={Object.keys(data[0])}
          data={visibleData}
        />
      );
    }
    return <span className="error">The table is empty.</span>;
  }, [data, visibleData, props.onClickHandler]);

  if (datasets.length === 0) {
    return <div className="data-viewer">Spec has no data</div>;
  }

  return (
    <>
      <div className="data-viewer-header">
        <Select
          className="data-dropdown"
          value={{label: selected, value: selected}}
          onChange={handleChange}
          options={datasets.map((d) => ({
            label: d,
            value: d,
          }))}
          isClearable={false}
          isSearchable={true}
        />
        <div className="pagination-wrapper">{pagination}</div>
      </div>
      <div className="data-table">
        <ErrorBoundary>{table}</ErrorBoundary>
      </div>
    </>
  );
};

export default DataViewer;
