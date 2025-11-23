import * as React from 'react';
import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import ReactPaginate from 'react-paginate';
import Select from 'react-select';
import * as vega from 'vega';
import {debounce} from 'vega';

import {useAppContext} from '../../context/app-context.js';
import ErrorBoundary from '../error-boundary/index.js';
import Table from '../table/renderer.js';
import './index.css';

export interface OwnComponentProps {
  onClickHandler: (header: string) => void;
}

const ROWS_PER_PAGE = 50;

const DataViewer: React.FC<OwnComponentProps> = (props) => {
  const {state} = useAppContext();
  const {view} = state;
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedData, setSelectedData] = useState('');
  const debouncedDataChangedRef = useRef<(() => void) | null>(null);
  const [renderTick, forceRerender] = useReducer((tick: number) => tick + 1, 0);

  const getDatasets = useCallback(() => {
    if (!view) {
      return [];
    }
    return Object.keys(
      view.getState({
        data: vega.truthy,
        signals: vega.falsy,
        recurse: true,
      }).data,
    );
  }, [view]);

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
    debouncedDataChangedRef.current = debounce(30, () => {
      forceRerender();
    });
  }, []);

  useEffect(() => {
    setDefaultDataset();
  }, [setDefaultDataset]);

  useEffect(() => {
    if (!view) {
      return;
    }
    const datasets = getDatasets();

    if (datasets.indexOf(selectedData) === -1) {
      setCurrentPage(0);
      setSelectedData('');
      return;
    }

    const currentSelected = selectedData;

    if (currentSelected && debouncedDataChangedRef.current) {
      view.addDataListener(currentSelected, debouncedDataChangedRef.current);
    }

    return () => {
      if (currentSelected && debouncedDataChangedRef.current) {
        view.removeDataListener(currentSelected, debouncedDataChangedRef.current);
      }
    };
  }, [view, selectedData, getDatasets]);

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
    if (!view || !selected) {
      return [];
    }

    const rawData = view.data(selected) ?? [];
    return [...rawData];
  }, [view, selected, renderTick]);

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
