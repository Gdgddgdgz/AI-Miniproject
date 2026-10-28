import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MetricsCard from '../components/Metrics/MetricsCard';
import ComparisonTable from '../components/Metrics/ComparisonTable';
import FeatureImportance from '../components/Charts/FeatureImportance';
import ActualVsPredicted from '../components/Charts/ActualVsPredicted';
import ConfusionMatrix from '../components/Charts/ConfusionMatrix';
import MLPipelineBanner from '../components/Pipeline/MLPipelineBanner';

import { api } from '../api/client';

const MemoMetricsCard = React.memo(MetricsCard);
const MemoComparisonTable = React.memo(ComparisonTable);
const MemoFeatureImportance = React.memo(FeatureImportance);
const MemoActualVsPredicted = React.memo(ActualVsPredicted);
const MemoConfusionMatrix = React.memo(ConfusionMatrix);

const ResultsDashboard = () => {
  const { trainResults, compareResults, problemType, datasetInfo, testSize, advancedConfig } = useAppContext();
  const navigate = useNavigate();

  const [inputFeatures, setInputFeatures] = React.useState({});
  const [predictionResult, setPredictionResult] = React.useState(null);
  const [predictLoading, setPredictLoading] = React.useState(false);
  const [predictError, setPredictError] = React.useState(null);

  if (!trainResults) {
    return (
      <div className="text-center py-20 mt-10 animate-slide-up">
        <h2 className="text-2xl font-bold mb-4 text-[#1a1f36]">No Results Available</h2>
        <button onClick={() => navigate('/')} className="btn-primary px-6 py-2">Return Home</button>
      </div>
    );
  }

  const { metrics, model, explanation, predictions, feature_importances, raw_features, recommended_item } = trainResults;
  const summary = compareResults?.summary || '';

  const featureKeys = raw_features || (datasetInfo?.columns ? datasetInfo.columns.filter(c => c !== trainResults.target) : []);

  const handleInputChange = (key, val) => {
    setInputFeatures(prev => ({ ...prev, [key]: val }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredictLoading(true);
    setPredictError(null);
    setPredictionResult(null);
    try {
      // Ensure we send every feature key expected by the model.
      // Build a normalized payload with all featureKeys present (use null for missing values).
      const payload = (featureKeys || []).reduce((acc, k) => {
        acc[k] = Object.prototype.hasOwnProperty.call(inputFeatures, k) ? inputFeatures[k] : null;
        return acc;
      }, {});

      const res = await api.predict(payload);
      setPredictionResult(res.data);
    } catch (err) {
      setPredictError(err.response?.data?.detail || err.message);
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-slide-up pb-24">

      {/* ML Pipeline Banner — what actually happened */}
      <MLPipelineBanner
        trainResults={trainResults}
        compareResults={compareResults}
        datasetInfo={datasetInfo}
        advancedConfig={advancedConfig}
        testSize={testSize}
        problemType={problemType}
      />

      
      {/* Header section Stripe Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-[#e3e8ee] pb-8 mt-6">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-[#1a1f36] mb-3 tracking-tight">Model Overview</h1>
          <div className="bg-white p-5 rounded-xl border border-[#e3e8ee] shadow-sm max-w-3xl">
            <p className="text-[#4f566b] text-[0.95rem] leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button onClick={() => navigate('/config')} className="btn-secondary px-4 py-2.5 shadow-sm font-semibold whitespace-nowrap text-sm">
            Adjust Configuration
          </button>
          <button onClick={() => api.downloadParquet('silver')} className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-all border border-emerald-200 flex items-center gap-1.5 shadow-xs whitespace-nowrap text-sm">
            <span>⚡ Silver (.parquet)</span>
          </button>
          <button onClick={() => api.downloadParquet('gold')} className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-all border border-amber-200 flex items-center gap-1.5 shadow-xs whitespace-nowrap text-sm">
            <span>📦 Gold Feature Store (.parquet)</span>
          </button>
          <button onClick={() => api.downloadModel()} className="btn-primary px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Export Pipeline (.joblib)</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-[#1a1f36] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#635bff]"></span>
          Performance Metrics: {model}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {problemType === 'classification' ? (
            <>
              <MemoMetricsCard title="Accuracy" value={`${(metrics.accuracy * 100).toFixed(2)}%`} />
              <MemoMetricsCard title="F1 Score" value={`${(metrics.f1_score * 100).toFixed(2)}%`} />
              <MemoMetricsCard title="Precision" value={`${(metrics.precision * 100).toFixed(2)}%`} />
              <MemoMetricsCard title="Recall" value={`${(metrics.recall * 100).toFixed(2)}%`} />
            </>
          ) : (
            <>
              <MemoMetricsCard title="R² Score" value={(metrics.r2).toFixed(4)} subtitle="Variance explained" />
              <MemoMetricsCard title="RMSE" value={(metrics.rmse).toFixed(4)} subtitle="Root Mean Squared Error" />
              <MemoMetricsCard title="MAE" value={(metrics.mae).toFixed(4)} subtitle="Mean Absolute Error" />
              <MemoMetricsCard title="Total Observations" value={datasetInfo?.shape?.[0]} subtitle="Rows in dataset" />
            </>
          )}
        </div>
      </div>

      {/* Recommendation Banner */}
      {recommended_item && (
        <section className="bg-white rounded-xl border border-[#e3e8ee] shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1a1f36] mb-4">Top predicted item</h2>
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {recommended_item.image_url && <img src={recommended_item.image_url} alt={recommended_item.label} className="w-40 h-40 rounded-xl object-cover bg-[#f7f9fc]" />}
            <div>
              <div className="text-lg font-semibold text-[#1a1f36]">{recommended_item.label}</div>
              <div className="text-sm text-[#4f566b] mt-1">Predicted {trainResults.target}: <strong>{recommended_item.prediction}</strong></div>
            </div>
          </div>
        </section>
      )}
      {!recommended_item && problemType === 'classification' && (
        <p className="text-sm text-[#64748b]">An image recommendation is shown for numeric targets or ordered numeric class labels.</p>
      )}

      <p className="text-sm text-[#4f566b]">{summary}</p>

      {/* Interactive Live Inference Playground */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e3e8ee] p-7">
        <div className="border-b border-[#e3e8ee] pb-4 mb-6">
          <h2 className="text-xl font-extrabold text-[#1a1f36] flex items-center gap-2">
            <span>⚡ Interactive Inference Playground</span>
            <span className="bg-[#e0e7ff] text-[#4338ca] text-xs px-2.5 py-1 rounded-full font-semibold">Live Model API</span>
          </h2>
          <p className="text-sm text-[#6b7280] mt-1">
            Test custom feature values against the selected model in this project session.
          </p>
        </div>

        {featureKeys.length === 0 ? (
          <p className="text-sm text-[#8792a2]">Feature definitions unavailable for interactive testing.</p>
        ) : (
          <form onSubmit={handlePredict} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featureKeys.map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#4f566b] truncate" title={key}>
                    {key}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter value..."
                    value={inputFeatures[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#e3e8ee] rounded-lg focus:outline-none focus:border-[#635bff]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={predictLoading}
                className="btn-primary px-6 py-2.5 font-bold shadow-sm flex items-center gap-2"
              >
                {predictLoading ? (
                  <span>Running Inference...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>Run Prediction</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {predictError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            <strong>Inference Error:</strong> {predictError}
          </div>
        )}

        {predictionResult && (
          <div className="mt-6 p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Predicted Value</span>
              <div className="text-2xl font-black text-[#0f172a] mt-0.5">
                {predictionResult.prediction}
              </div>
            </div>
            {predictionResult.probabilities && (
              <div className="flex items-center gap-3">
                {Object.entries(predictionResult.probabilities).map(([cls, prob]) => (
                  <div key={cls} className="bg-white px-3 py-1.5 rounded-md border border-[#e2e8f0] text-xs font-medium">
                    <span className="text-[#64748b] mr-1">{cls}:</span>
                    <span className="font-bold text-[#635bff]">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-[#e3e8ee] p-7 min-h-[420px]">
          {problemType === 'classification' ? (
            <MemoConfusionMatrix matrix={metrics.confusion_matrix} labels={metrics.confusion_matrix_labels} />
          ) : (
            <MemoActualVsPredicted predictions={predictions} />
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-[#e3e8ee] p-7 min-h-[420px]">
          <MemoFeatureImportance data={feature_importances} />
        </div>
      </div>

      <div className="pt-4 border-t border-[#e3e8ee]">
        <MemoComparisonTable comparison={compareResults.comparison} problemType={problemType} metric={compareResults.metric} />
      </div>

    </div>
  );
};


export default ResultsDashboard;
