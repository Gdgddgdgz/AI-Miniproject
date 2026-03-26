import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MetricsCard from '../components/Metrics/MetricsCard';
import ComparisonTable from '../components/Metrics/ComparisonTable';
import FeatureImportance from '../components/Charts/FeatureImportance';
import ActualVsPredicted from '../components/Charts/ActualVsPredicted';
import ConfusionMatrix from '../components/Charts/ConfusionMatrix';

import { api } from '../api/client';

const MemoMetricsCard = React.memo(MetricsCard);
const MemoComparisonTable = React.memo(ComparisonTable);
const MemoFeatureImportance = React.memo(FeatureImportance);
const MemoActualVsPredicted = React.memo(ActualVsPredicted);
const MemoConfusionMatrix = React.memo(ConfusionMatrix);

const ResultsDashboard = () => {
  const { trainResults, compareResults, problemType, datasetInfo } = useAppContext();
  const navigate = useNavigate();

  if (!trainResults || !compareResults) {
    return (
      <div className="text-center py-20 mt-10 animate-slide-up">
        <h2 className="text-2xl font-bold mb-4 text-[#1a1f36]">No Results Available</h2>
        <button onClick={() => navigate('/')} className="btn-primary px-6 py-2">Return Home</button>
      </div>
    );
  }

  const { metrics, model, explanation, predictions, feature_importances } = trainResults;
  const { best_model, summary } = compareResults;
  const isBest = best_model && best_model.model === model;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-slide-up pb-24">
      
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
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => navigate('/config')} className="btn-secondary px-6 py-2.5 shadow-sm font-semibold whitespace-nowrap">
            Adjust Configuration
          </button>
          <button onClick={() => api.downloadModel()} className="btn-primary px-6 py-2.5 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>Export Model</span>
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
      {!isBest && best_model && (
        <div className="saas-card overflow-hidden flex items-stretch border-[#f59e0b]/30 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-2 bg-[#f59e0b]"></div>
          <div className="p-5 flex items-start gap-4 flex-1">
            <div className="w-8 h-8 rounded-full bg-[#fffaeb] flex items-center justify-center flex-shrink-0 text-[#b54708]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1a1f36] mb-1">Optimization Opportunity Discovered</h3>
              <p className="text-[#4f566b] text-sm leading-relaxed">{summary}</p>
              <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-[#8792a2]">
                <span className="bg-[#f7f9fc] px-2.5 py-1 rounded border border-[#e3e8ee]">
                  Your Model: {problemType === 'classification' ? `${(metrics.f1_score*100).toFixed(2)}%` : metrics.r2.toFixed(4)}
                </span>
                <span className="bg-[#e0f2f1] text-[#0e6245] px-2.5 py-1 rounded border border-[#a7f3d0]">
                  Recommended Model: {problemType === 'classification' ? `${(best_model.score*100).toFixed(2)}%` : best_model.score.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <MemoComparisonTable comparison={compareResults.comparison} problemType={problemType} />
      </div>

    </div>
  );
};

export default ResultsDashboard;
