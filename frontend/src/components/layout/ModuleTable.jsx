import React from 'react';

function ModuleTable({ rows }) {
  if (!rows || rows.length === 0) {
    return null;
  }

  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set())
  ).slice(0, 8);

  return (
    <div className="table-wrapper">
      <table className="module-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row?.id || row?._id || 'row'}-${index}`}>
              {columns.map((column) => {
                const value = row?.[column];
                return (
                  <td key={column}>
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value)
                      : String(value ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ModuleTable;
