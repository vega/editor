import React from 'react';

interface TableProps {
  header: string[];
  data: any[];
  onClickHandler: (header: string) => void;
}

const Table: React.FC<TableProps> = ({header, data, onClickHandler}) => {
  return (
    <table className="editor-table">
      <thead>
        <tr>
          {header.map((h, i) => (
            <th key={i} className="pointer" onClick={() => onClickHandler(h)}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {header.map((h, j) => (
              <td key={j}>{String(row[h])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
