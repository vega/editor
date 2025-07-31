import * as React from 'react';
import {Search} from 'react-feather';
import {isDate, isFunction} from 'vega';
import {stringify} from 'vega-tooltip';
import './index.css';

interface Props {
  header: string[];
  data: any[];
  onClickHandler?: (header: string) => void;
}

export default function Table(props: Props) {
  const {header, data, onClickHandler} = props;

  const headerNodes = header.map((h) => (
    <th onClick={() => onClickHandler?.(h)} key={h}>
      {h}
      <Search />
    </th>
  ));

  const tableBody = data.map((row, i) => {
    const rowNodes = header.map((field, j) => {
      const {tooLong, formatted} = formatValueLong(row[field]);
      const key = `${field} ${j}`;
      if (tooLong) {
        return (
          <td key={key} title="The field is too large to be displayed. Please use the view API (see JS console).">
            <span>(...)</span>
          </td>
        );
      }
      return <td key={key}>{formatted}</td>;
    });

    return <tr key={i}>{rowNodes}</tr>;
  });

  return (
    <table className="editor-table">
      <thead>
        <tr>{header.length > 0 ? headerNodes : <th>datum</th>}</tr>
      </thead>
      <tbody>{tableBody}</tbody>
    </table>
  );
}

const MAX_DEPTH = 3;
const MAX_LENGTH = 150;

function formatNumberValue(value: number) {
  return isNaN(value)
    ? 'NaN'
    : value === Number.POSITIVE_INFINITY
      ? 'Infinity'
      : value === Number.NEGATIVE_INFINITY
        ? '-Infinity'
        : stringify(value, MAX_DEPTH);
}

export function formatValueLong(value: any) {
  if (value === undefined) {
    return {formatted: 'undefined', tooLong: false};
  }
  if (typeof value === 'number') {
    const formatted = formatNumberValue(value);
    return {formatted, tooLong: formatted.length > MAX_LENGTH};
  }
  if (isFunction(value)) {
    const formatted = value.toString();
    return {formatted, tooLong: formatted.length > MAX_LENGTH};
  }
  if (isDate(value)) {
    const formatted = new Date(value).toUTCString();
    return {formatted, tooLong: formatted.length > MAX_LENGTH};
  }
  const formatted = stringify(value, MAX_DEPTH);
  return {formatted, tooLong: formatted.length > MAX_LENGTH};
}
