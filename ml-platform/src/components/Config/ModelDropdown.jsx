import React from 'react';
import { useAppContext } from '../../context/AppContext';

const CLASSIFICATION_MODELS = ['Logistic Regression', 'Decision Tree', 'Random Forest', 'KNN'];
const REGRESSION_MODELS = ['Linear Regression', 'Decision Tree Regressor', 'Random Forest Regressor'];

const ModelDropdown = () => {
  const { problemType, selectedModel, setSelectedModel, targetColumn, setProblemType } = useAppContext();
  const isCardDisabled = !targetColumn;
  const isSelectDisabled = !targetColumn || !problemType;

  let availableModels = [];
  if (problemType === 'classification') availableModels = CLASSIFICATION_MODELS;
  else if (problemType === 'regression') availableModels = REGRESSION_MODELS;

  return (
    <div className={`bg-white rounded-2xl border border-[#e3e8ee] shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-7 mb-6 transition-all duration-300 hover:shadow-[0_4px_20px_-3px_rgba(6,81,237,0.12)] ${isCardDisabled ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-[#e0e7ff] to-[#c7d2fe] text-[#3730a3] flex items-center justify-center font-bold text-sm shadow-sm border border-[#a5b4fc]/30">
          2
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1a1f36] tracking-tight">Algorithm Selection</h3>
          <p className="text-[#4f566b] text-sm mt-0.5">Determine the specific mathematical approach Aura uses.</p>
        </div>
      </div>

      <div className="mt-6 ml-12">
        <div className="mb-5 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
          <div className="flex justify-between items-center h-8">
            <span className="text-[#4f566b] text-sm font-semibold tracking-wide uppercase">Task Type</span>
            {targetColumn ? (
              <div className="flex gap-1.5 bg-[#e2e8f0] rounded-lg p-1.5 shadow-inner">
                <button 
                  onClick={() => setProblemType('classification')}
                  className={`px-4 py-1.5 text-[0.8rem] font-bold rounded-md transition-all ${problemType === 'classification' ? 'bg-white text-[#1a1f36] shadow-sm transform scale-100' : 'text-[#64748b] hover:text-[#1a1f36] hover:bg-white/50 scale-95'}`}
                >
                  Classification
                </button>
                <button 
                  onClick={() => setProblemType('regression')}
                  className={`px-4 py-1.5 text-[0.8rem] font-bold rounded-md transition-all ${problemType === 'regression' ? 'bg-white text-[#1a1f36] shadow-sm transform scale-100' : 'text-[#64748b] hover:text-[#1a1f36] hover:bg-white/50 scale-95'}`}
                >
                  Regression
                </button>
              </div>
            ) : (
               <span className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-[#e2e8f0]">Awaiting Target</span>
            )}
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isSelectDisabled}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-xl px-5 py-3.5 text-sm text-[#1e293b] font-medium shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#635bff]/20 focus:border-[#635bff] disabled:bg-[#f1f5f9] disabled:text-[#94a3b8] transition-all cursor-pointer"
          >
            <option value="" disabled>Choose your algorithm structure...</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>{model}</option>
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

export default ModelDropdown;
