import React from 'react';
import { useAppContext } from '../../context/AppContext';

const SplitSlider = () => {
  const { testSize, setTestSize, targetColumn } = useAppContext();
  const isDisabled = !targetColumn;

  const trainPct = Math.round((1 - testSize) * 100);
  const testPct = Math.round(testSize * 100);

  return (
    <div className={`bg-white rounded-2xl border border-[#e3e8ee] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-7 mb-8 transition-all duration-300 hover:shadow-[0_4px_20px_-3px_rgba(6,81,237,0.12)] ${isDisabled ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] text-[#3730a3] flex items-center justify-center font-bold text-sm shadow-sm border border-[#a5b4fc]/30">
          3
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1a1f36] tracking-tight">Data Allocation</h3>
          <p className="text-[#4f566b] text-sm mt-0.5">Split your dataset into strictly disjoint training and evaluation sets.</p>
        </div>
      </div>

      <div className="mt-8 ml-12 bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0]">
        <div className="relative pt-2">
          <input 
            type="range" 
            min="0.1" 
            max="0.5" 
            step="0.05"
            value={testSize} 
            onChange={(e) => setTestSize(parseFloat(e.target.value))}
            disabled={isDisabled}
            className="w-full h-2.5 bg-[#cbd5e1] rounded-full appearance-none cursor-pointer accent-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[#4f46e5]/20 disabled:opacity-50 transition-all shadow-inner"
          />
        </div>

        <div className="flex justify-between items-center text-sm pt-8">
          <div className="flex flex-col items-start w-1/2 pr-6 border-r border-[#cbd5e1]/50">
            <span className="text-[#64748b] font-bold uppercase tracking-widest text-[0.65rem] mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Training Set
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-[#0f172a] drop-shadow-sm">{trainPct}%</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end w-1/2 pl-6">
            <span className="text-[#64748b] font-bold uppercase tracking-widest text-[0.65rem] mb-1.5 flex items-center gap-1.5">
              Holdout Test Set
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-[#4f46e5] drop-shadow-sm">{testPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitSlider;
