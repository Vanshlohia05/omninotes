import React from 'react';
import { Plus, Trash2, MoreHorizontal } from 'lucide-react';
import { TableData } from '../../types/note';

interface TableBlockProps {
  data?: TableData;
  onChange: (newData: TableData) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ data, onChange }) => {
  const tableData: TableData = data || {
    headers: ['Column 1', 'Column 2', 'Column 3'],
    rows: [
      ['Cell 1', 'Cell 2', 'Cell 3'],
      ['Cell 4', 'Cell 5', 'Cell 6']
    ]
  };

  const addColumn = () => {
    const newColIndex = tableData.headers.length + 1;
    const newHeaders = [...tableData.headers, `Column ${newColIndex}`];
    const newRows = tableData.rows.map((row) => [...row, '']);
    onChange({ headers: newHeaders, rows: newRows });
  };

  const removeColumn = (colIndex: number) => {
    if (tableData.headers.length <= 1) return;
    const newHeaders = tableData.headers.filter((_, i) => i !== colIndex);
    const newRows = tableData.rows.map((row) => row.filter((_, i) => i !== colIndex));
    onChange({ headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(tableData.headers.length).fill('');
    onChange({
      ...tableData,
      rows: [...tableData.rows, newRow]
    });
  };

  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length <= 1) return;
    const newRows = tableData.rows.filter((_, i) => i !== rowIndex);
    onChange({ ...tableData, rows: newRows });
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...tableData.headers];
    newHeaders[index] = value;
    onChange({ ...tableData, headers: newHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = tableData.rows.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const updatedRow = [...row];
        updatedRow[colIndex] = value;
        return updatedRow;
      }
      return row;
    });
    onChange({ ...tableData, rows: newRows });
  };

  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-[#202020]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-neutral-800/60 border-b border-black/10 dark:border-white/10">
            {tableData.headers.map((header, colIdx) => (
              <th key={colIdx} className="group relative p-2 text-left font-medium text-slate-700 dark:text-slate-200 border-r border-black/5 dark:border-white/5 last:border-r-0">
                <input
                  type="text"
                  value={header}
                  onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                  className="w-full bg-transparent font-semibold focus:outline-none focus:bg-amber-50/50 dark:focus:bg-amber-950/20 px-1 py-0.5 rounded"
                  placeholder="Header..."
                />
                {tableData.headers.length > 1 && (
                  <button
                    onClick={() => removeColumn(colIdx)}
                    className="absolute right-1 top-2 hidden group-hover:flex items-center justify-center p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500"
                    title="Delete column"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </th>
            ))}
            <th className="w-10 p-2 text-center">
              <button
                onClick={addColumn}
                className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-200/50 dark:hover:bg-neutral-700 transition"
                title="Add Column"
              >
                <Plus className="w-4 h-4" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors group"
            >
              {row.map((cell, colIdx) => (
                <td key={colIdx} className="p-2 border-r border-black/5 dark:border-white/5 last:border-r-0">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                    className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 dark:focus:bg-amber-950/20 px-1 py-0.5 rounded text-slate-800 dark:text-slate-100"
                    placeholder="Empty..."
                  />
                </td>
              ))}
              <td className="w-10 p-2 text-center">
                {tableData.rows.length > 1 && (
                  <button
                    onClick={() => removeRow(rowIdx)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition"
                    title="Delete row"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-1.5 border-t border-black/5 dark:border-white/5 bg-slate-50/40 dark:bg-neutral-800/20">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 px-2 py-1 rounded transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Row
        </button>
      </div>
    </div>
  );
};
