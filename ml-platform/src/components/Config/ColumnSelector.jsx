import React from 'react';
import { useAppContext } from '../../context/AppContext';

const ColumnSelector = () => {
  const { columns, targetColumn, setTargetColumn } = useAppContext();
  if (!columns || columns.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#e3e8ee] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-7 mb-6 transition-all hover:shadow-[0_4px_20px_-3px_rgba(6,81,237,0.12)]">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] text-[#3730a3] flex items-center justify-center font-bold text-sm shadow-sm border border-[#a5b4fc]/30">
          1
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1a1f36] tracking-tight">Target Variable</h3>
          <p className="text-[#4f566b] text-sm mt-0.5">Select the column you want the AI to learn to predict.</p>
        </div>
      </div>

      <div className="mt-6 ml-12">
        <div className="relative">
          <select
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-xl px-5 py-3.5 text-sm text-[#1e293b] font-medium shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#635bff]/20 focus:border-[#635bff] transition-all cursor-pointer"
          >
            <option value="" disabled>Choose target column from dataset...</option>
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector;
