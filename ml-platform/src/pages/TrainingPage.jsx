import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../api/client';

const TrainingPage = () => {
  const { 
    targetColumn, 
    selectedModel, 
    testSize, 
    problemType,
    advancedConfig,
    setTrainResults, 
    setCompareResults 
  } = useAppContext();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Engine...');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!targetColumn || !selectedModel) {
      navigate('/config');
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const startTraining = async () => {
      try {
        // problemType already detected on ConfigPage — no need to call preprocessDataset again
        if (isMounted) { setProgress(30); setStatusText(`Training foundation ${selectedModel} model...`); }
        const trainRes = await api.trainModel(targetColumn, selectedModel, testSize, problemType, advancedConfig);
        if (isMounted) setTrainResults(trainRes.data);

        if (isMounted) { setProgress(70); setStatusText('Benchmarking all available algorithms...'); }
        const compRes = await api.compareModels(targetColumn, testSize, problemType, advancedConfig);
        if (isMounted) setCompareResults(compRes.data);

        if (isMounted) {
          setProgress(100);
          setStatusText('Finalizing model weights...');
          setTimeout(() => navigate('/results'), 700);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Error occurred during training.');
          setProgress(100);
        }
      }
    };
    startTraining();
    return () => { isMounted = false; controller.abort(); };
  // advancedConfig included so re-training with new params isn't stale
  }, [targetColumn, selectedModel, testSize, problemType, advancedConfig, navigate, setTrainResults, setCompareResults]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-20">
      <div className="saas-card p-10 relative overflow-hidden text-center">
        
        <h2 className="text-2xl font-bold mb-10 text-[#1a1f36]">Model Training Flow</h2>

        {error ? (
          <div className="bg-[var(--danger-bg)] border border-[#fca5a5] rounded-xl p-6 text-left">
            <h3 className="text-[var(--danger-text)] text-lg font-bold flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Training Interrupted
            </h3>
            <p className="text-[#b42318]">{error}</p>
            <button onClick={() => navigate('/config')} className="mt-5 btn-secondary px-5 py-2">
              Review Configuration
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-slide-up">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="44" stroke="#e3e8ee" strokeWidth="6" fill="none" />
                  <circle cx="48" cy="48" r="44" stroke="var(--accent-primary)" strokeWidth="6" fill="none" 
                          strokeDasharray="276" strokeDashoffset={276 - (276 * progress) / 100} 
                          className="transition-all duration-700 ease-out" 
                          strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-[#1a1f36]">{progress}%</div>
              </div>
              <h3 className="text-[#1a1f36] font-medium animate-pulse">{statusText}</h3>
            </div>
            
            <div className="bg-[#f7f9fc] rounded-lg p-5 border border-[#e3e8ee] flex justify-between items-center text-left">
              <div>
                <span className="block text-[#8792a2] text-xs font-bold uppercase tracking-wide">Target Objective</span>
                <span className="block text-[#1a1f36] font-medium">{targetColumn}</span>
              </div>
              <div className="w-px h-8 bg-[#e3e8ee]"></div>
              <div>
                <span className="block text-[#8792a2] text-xs font-bold uppercase tracking-wide">Foundation Model</span>
                <span className="block text-[#1a1f36] font-medium">{selectedModel}</span>
              </div>
              <div className="w-px h-8 bg-[#e3e8ee]"></div>
              <div className="pr-4">
                <span className="block text-[#8792a2] text-xs font-bold uppercase tracking-wide">Paradigm</span>
                <span className="badge badge-blue mt-1 uppercase text-[10px]">{problemType}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;
