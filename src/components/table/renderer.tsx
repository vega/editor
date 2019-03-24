import * as React from 'react';
import { isArray, isDate, isObject } from 'vega';
import { stringify } from 'vega-tooltip';
import './index.css';

interface Props {
  header: string[];
  data: any[];
}

const MAX_DEPTH = 3;
const MAX_LENGTH = 120;

export default class Table extends React.PureComponent<Props> {
  public render() {
    const headerNodes = this.props.header.map(h => <th key={h}>{h}</th>);

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
      <div className="data-table">
        <table>
          <thead>
            <tr>{headerNodes}</tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </table>
      </div>
    );
  }
}

function formatValueLong(value: any) {
  const formatted = value === undefined ? 'undefined' : stringify(value, MAX_DEPTH);
  if (formatted.length > MAX_LENGTH) {
    return { formatted: null, tooLong: true };
  }

  return { formatted, tooLong: false };
}
