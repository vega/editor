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

const MAX_DEPTH = 3;
const MAX_LENGTH = 150;

export default class Table extends React.PureComponent<Props> {
  public render() {
    const headerNodes = this.props.header.map((h) => (
      <th onClick={() => this.props.onClickHandler && this.props.onClickHandler(h)} key={h}>
        {h}
        <Search />
      </th>
    ));

    const tableBody = this.props.data.map((row, i) => {
      const rowNodes = this.props.header.map((field, j) => {
        let tooLong = false;
        let formatted = '';
        if (!isDate(row[field])) {
          tooLong = formatValueLong(row[field]).tooLong;
          formatted = formatValueLong(row[field]).formatted;
        } else {
          tooLong = false;
          formatted = new Date(row[field]).toUTCString();
        }
        const key = `${field} ${j}`;
        if (tooLong) {
          return (
            <td key={key} title="The field is too large to be displayed. Please use the view API (see JS console).">
              <span>(...)</span>
            </td>
          );
        } else {
          return <td key={key}>{formatted}</td>;
        }
      });

      return <tr key={i}>{rowNodes}</tr>;
    });

    return (
      <table className="editor-table">
        <thead>
          <tr>{headerNodes}</tr>
        </thead>
        <tbody>{tableBody}</tbody>
      </table>
    );
  }
}

export function formatValueLong(value: any) {
  const formatted =
    value === undefined ? 'undefined' : isFunction(value) ? value.toString() : stringify(value, MAX_DEPTH);
  if (formatted.length > MAX_LENGTH) {
    return {formatted: null, tooLong: true};
  }

  return {formatted, tooLong: false};
}
