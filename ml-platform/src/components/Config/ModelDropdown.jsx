import React from 'react';
import { useAppContext } from '../../context/AppContext';

const ModelDropdown = () => {
  const { problemType, targetColumn, setProblemType, setAdvancedConfig } = useAppContext();
  const disabled = !targetColumn;
  const chooseTask = (type) => {
    setProblemType(type);
    setAdvancedConfig((current) => ({ ...current, optimization_metric: 'auto' }));
  };

  return (
    <section className={`bg-white rounded-2xl border border-[#e3e8ee] shadow-sm p-7 mb-6 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#e0e7ff] text-[#3730a3] flex items-center justify-center font-bold text-sm">2</div>
        <div>
          <h3 className="text-xl font-bold text-[#1a1f36]">Prediction task</h3>
          <p className="text-[#4f566b] text-sm mt-1">Choose how to interpret the target. Available models will be benchmarked automatically.</p>
        </div>
      </div>
      <div className="ml-12 flex gap-2" role="group" aria-label="Prediction task">
        {['classification', 'regression'].map((type) => (
          <button
            key={type}
            type="button"
            disabled={disabled}
            aria-pressed={problemType === type}
            onClick={() => chooseTask(type)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${problemType === type ? 'bg-[#635bff] text-white' : 'bg-[#f1f5f9] text-[#4f566b]'} disabled:cursor-not-allowed`}
          >
            {type}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ModelDropdown;
