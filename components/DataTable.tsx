import React from 'react';
import { TrashIcon, EditIcon, PrintIcon } from './Icons';
import { ExtractedData, ColumnConfig } from '../types';

interface DataTableProps {
  records: ExtractedData[];
  columnConfig: ColumnConfig[];
  onClear: () => void;
  onEdit: (record: ExtractedData) => void;
  onDelete: (recordId: string) => void;
  onPrint: (record: ExtractedData) => void; // New prop
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  columnConfig,
  onClear,
  onEdit,
  onDelete,
  onPrint,
}) => {
  if (records.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8">
        <h2 className="text-xl font-semibold text-base-content mb-2">No Saved Contacts</h2>
        <p>Your saved contact data will appear here.</p>
        <p>Start by scanning a new contact.</p>
      </div>
    );
  }

  const visibleColumns = columnConfig.filter(c => c.visible);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-2xl font-bold text-base-content">Saved Contacts</h2>
        <button
          onClick={onClear}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center text-sm"
          title="Clear all saved data"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Clear All
        </button>
      </div>
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-base-300">
            <tr>
              {visibleColumns.map(col => (
                <th key={col.key} scope="col" className="px-6 py-3">{col.header}</th>
              ))}
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={record.id || index} className="bg-base-200 border-b border-base-300 hover:bg-base-300/50">
                {visibleColumns.map(col => (
                  <td key={col.key} className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {record[col.key] || 'N/A'}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-4">
                    <button 
                      onClick={() => onEdit(record)} 
                      className="text-brand-light hover:text-white transition-colors" 
                      title="Edit Contact"
                    >
                      <EditIcon className="w-5 h-5"/>
                    </button>
                    <button 
                      onClick={() => onDelete(record.id!)} 
                      className="text-gray-500 hover:text-red-500 transition-colors" 
                      title="Delete Contact"
                    >
                      <TrashIcon className="w-5 h-5"/>
                    </button>
                    <button 
                      onClick={() => onPrint(record)}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      title="Print Contact"
                    >
                      <PrintIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
