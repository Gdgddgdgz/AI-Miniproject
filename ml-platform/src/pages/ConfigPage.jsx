import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../api/client';
import ColumnSelector from '../components/Config/ColumnSelector';
import ModelDropdown from '../components/Config/ModelDropdown';
import SplitSlider from '../components/Config/SplitSlider';
import AdvancedSettings from '../components/Config/AdvancedSettings';

const ConfigPage = () => {
  const { datasetInfo, targetColumn, selectedModel, setProblemType } = useAppContext();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!datasetInfo) navigate('/');
  }, [datasetInfo, navigate]);

  useEffect(() => {
    if (targetColumn && datasetInfo) {
      const detectProblemType = async () => {
        setIsAnalyzing(true);
        try {
          const preRes = await api.preprocessDataset(targetColumn);
          setProblemType(preRes.data.problem_type);
        } catch (err) {
          console.error('Failed to detect problem type:', err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      
      detectProblemType();
    }
  }, [targetColumn, datasetInfo, setProblemType]);

  const isReady = targetColumn && selectedModel;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20 mt-8">
      
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e3e8ee]">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36] tracking-tight">Machine Learning Configuration</h1>
          <p className="text-[#4f566b] text-sm mt-1">Setup your objective, algorithms, and processing parameters.</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="btn-secondary px-4 py-2 text-sm"
        >
          Back
        </button>
      </div>

      <div className="w-full">
        <ColumnSelector />
        <ModelDropdown />
        <SplitSlider />
        <AdvancedSettings />
          
        <div className="mt-2">
          <div className="bg-white rounded-2xl border border-[#e3e8ee] shadow-[0_4px_20px_-3px_rgba(6,81,237,0.12)] overflow-hidden">
            <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="saas-spinner w-6 h-6"></div>
                  <span className="ml-3 text-sm font-bold text-[#4f46e5]">Analyzing Data...</span>
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">Ready to train?</h3>
                <p className="text-[#64748b] text-sm">
                  The engine will process your data and find the optimal weights for your prediction.
                </p>
              </div>
              
              <button 
                onClick={() => isReady && navigate('/training')}
                disabled={!isReady}
                className={`px-8 py-3.5 text-[0.95rem] rounded-xl transition-all duration-300 font-bold tracking-wide flex justify-center items-center gap-2 whitespace-nowrap min-w-[220px] shadow-sm ${
                  isReady 
                    ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white hover:shadow-lg hover:-translate-y-0.5' 
                    : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed border border-[#e2e8f0]'
                }`}
              >
                {isReady ? (
                  <>
                    Start Training
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                ) : 'Select Target and Model'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConfigPage;
