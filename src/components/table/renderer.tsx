import './index.css';

import * as React from 'react';
import {  escapeHTML, formatValue } from 'vega-tooltip';

interface Props {
  header: string[];
  data: object[];
}

const MAX_DEPTH = 2;

export default class Table extends React.PureComponent<Props> {
  public escapeHTML(data: string) {
    return data
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  public render() {
    const headerNodes = this.props.header.map(h => <th key={h}>{h}</th>);

    const tableBody = this.props.data.map((row, i) => {
      const rowNodes = this.props.header.map((field, j) => {
        const value = formatValue(row[field], escapeHTML, MAX_DEPTH);
        if (value.length > 24) {
          return <td className="tooltip" data-tip="The field is too large to be displayed. Please use the view API (see JS console)."><span>(...)</span></td>
        } else {
          return <td key={`${field} ${j}`}>{value}</td>
        }
      };

      return <tr key={i}>
        {rowNodes}
      </tr>
    }
  );

    return (
      <table className="data-table">
        <thead>
          <tr>{headerNodes}</tr>
        </thead>
        <tbody>{tableBody}</tbody>
      </table>
    );
  }
}

// public generateTable(data: any) {
//   if (isObject(data)) {
//     data = Object.values(data);
//   }
//   if (data.length === 0) {
//     return;
//   }
//   let table = '<table><tr>';
//   // Creating table header using first object
//   Object.keys(data[0]).map(key => {
//     table += `<th>${key}</th>`;
//   });
//   table += '</tr>';
//   // Content of table
//   const content = Object.values(data);
//   const start = OPTIONS.perPage * this.state.currentPage;
//   const end = start + OPTIONS.perPage;
//   content.slice(start, end).map(key => {
//     table += '<tr>';
//     Object.values(key).map(value => {
//       // Replacing large data with (...)
//       // Width of table cell / average width of a char i.e 8px
//       if (value && value.length > 24) {
//         value = this.escapeHTML(value);
//         table += `<td class="tooltip" data-tip="The field is too large to be displayed. Please use the view API (see JS console)."><span>(...)<span></td>`;
//       } else {
//         table += `<td>${value}</td>`;
//       }
//     });
//     table += '</tr>';
//   });
//   table += '</table>';

//   return table;
// }
