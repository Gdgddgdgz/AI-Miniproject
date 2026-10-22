import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../api/client';

const TrainingPage = () => {
  const { targetColumn, problemType, testSize, advancedConfig, compareResults, setTrainResults, setCompareResults } = useAppContext();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!targetColumn || !problemType) navigate('/config', { replace: true });
  }, [targetColumn, problemType, navigate]);

  const runComparison = async () => {
    setRunning(true);
    setError('');
    setTrainResults(null);
    setCompareResults(null);
    try {
      const response = await api.compareModels(targetColumn, testSize, problemType, advancedConfig);
      const result = response.data;
      if (!result.best_result) {
        setCompareResults(result);
        setError(result.summary || 'No model completed successfully. Review the model errors below.');
        return;
      }
      setCompareResults(result);
      setTrainResults(result.best_result);
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Model comparison failed.');
    } finally {
      setRunning(false);
    }
  };

  if (!targetColumn || !problemType) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-20">
      <div className="saas-card p-10 text-center">
        <h1 className="text-2xl font-bold mb-3 text-[#1a1f36]">Benchmark available models</h1>
        <p className="text-[#4f566b] mb-8">Task: {problemType} · Target: {targetColumn}</p>
        {running ? (
          <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
            <div className="saas-spinner w-10 h-10" />
            <p className="text-[#4f566b]">Training and validating models. This may take a few minutes.</p>
          </div>
        ) : (
          <button type="button" onClick={runComparison} className="btn-primary px-6 py-3 font-bold">
            Start Model Comparison
          </button>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left text-red-700" role="alert">
            {error}
            {compareResults?.comparison?.some((item) => item.error) && (
              <ul className="mt-3 list-disc pl-5 text-sm">
                {compareResults.comparison.filter((item) => item.error).map((item) => (
                  <li key={item.model}>{item.model}: {item.error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;
