import React from 'react';

const metricTitles = {
  accuracy: 'Accuracy', f1: 'Weighted F1', precision: 'Weighted precision',
  recall: 'Weighted recall', r2: 'R²', rmse: 'RMSE', mae: 'MAE',
};

const formatScore = (score, metric) => {
  if (score === null || score === undefined || Number.isNaN(Number(score))) return '—';
  return ['accuracy', 'f1', 'precision', 'recall'].includes(metric)
    ? `${(Number(score) * 100).toFixed(2)}%`
    : Number(score).toFixed(4);
};

const ComparisonTable = ({ comparison, problemType, metric = 'auto' }) => {
  if (!comparison || comparison.length === 0) return null;
  const effectiveMetric = metric === 'auto' ? (problemType === 'classification' ? 'f1' : 'r2') : metric;
  const metricName = metricTitles[effectiveMetric] || 'Score';

  return (
    <div className="w-full">
      <div className="py-5 flex items-center justify-between">
        <h3 className="font-bold text-lg text-[#1a1f36]">Algorithm leaderboard</h3>
        <span className="text-[#8792a2] text-xs bg-[#f7f9fc] px-2.5 py-1 rounded border border-[#e3e8ee]">
          Ranked by {metricName} cross-validation score
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#e3e8ee] shadow-sm">
        <table className="saas-table">
          <thead className="bg-[#f7f9fc]">
            <tr>
              <th>Rank</th><th>Algorithm</th><th>{metricName} (CV)</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, idx) => (
              <tr key={row.model} className={!row.error && idx === 0 ? 'bg-[#fffaeb]' : ''}>
                <td className="text-center font-bold">{row.error ? '—' : `#${idx + 1}`}</td>
                <td className="font-semibold text-[#1a1f36]">{row.model}</td>
                <td className="font-mono font-bold text-[#635bff]">{row.error ? '—' : formatScore(row.score, effectiveMetric)}</td>
                <td className={row.error ? 'text-red-700 text-sm' : 'text-green-700 text-sm'}>{row.error || 'Completed'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
