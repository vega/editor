import * as React from 'react';
import { isDate } from 'vega';
import { formatValue } from 'vega-tooltip';
import './index.css';

interface Props {
  header: string[];
  data: any[];
}

const MAX_DEPTH = 2;
const MAX_LENGTH = 50;

export default class Table extends React.PureComponent<Props> {
  public render() {
    const headerNodes = this.props.header.map(h => <th key={h}>{h}</th>);

    const tableBody = this.props.data.map((row, i) => {
      const rowNodes = this.props.header.map((field, j) => {
        let tooLong = false;
        let formatted = '';
        if (!isDate(row[field])) {
          tooLong = this.formatValue(row[field]).tooLong;
          formatted = this.formatValue(row[field]).formatted;
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
  private escapeHTML(data: string | number) {
    return String(data)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatValue(value: any) {
    const formatted = formatValue(value, this.escapeHTML, MAX_DEPTH);
    if (formatted.length > MAX_LENGTH) {
      return { formatted: null, tooLong: true };
    }

    return { formatted, tooLong: false };
  }
}
