import React from 'react';
import { useAppContext } from '../../context/AppContext';

const DatasetTable = ({ maxRows = 10, showDtypes = true }) => {
  const { previewData, columns, datasetInfo } = useAppContext();

  if (!previewData || previewData.length === 0) return null;

  const displayData = previewData.slice(0, maxRows);

  const getBadgetype = (dtype) => {
    if (dtype.includes('int') || dtype.includes('float')) return 'badge-blue';
    if (dtype.includes('bool')) return 'badge-orange';
    return 'badge-gray'; // string/object
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="saas-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[#1a1f36]">{col}</span>
                    {showDtypes && datasetInfo?.dtypes && (
                      <span className={`badge ${getBadgetype(datasetInfo.dtypes[col])} self-start`}>
                        {datasetInfo.dtypes[col]}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={`${idx}-${col}`}>
                    {row[col] === null ? <span className="text-[#8792a2] italic text-xs">NaN</span> : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetTable;
