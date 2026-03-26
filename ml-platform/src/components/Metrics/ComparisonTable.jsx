import React from 'react';

const ComparisonTable = ({ comparison, problemType }) => {
  if (!comparison || comparison.length === 0) return null;

  const metricName = problemType === 'classification' ? 'F1 Score' : 'R² Score';

  return (
    <div className="w-full">
      <div className="py-5 flex items-center justify-between">
        <h3 className="font-bold text-lg text-[#1a1f36] flex items-center gap-2">
          Algorithm Leaderboard
        </h3>
        <span className="text-[#8792a2] text-xs font-medium bg-[#f7f9fc] px-2.5 py-1 rounded border border-[#e3e8ee]">
          Ranked by {metricName}
        </span>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-[#e3e8ee] shadow-sm">
        <table className="saas-table">
          <thead className="bg-[#f7f9fc]">
            <tr>
              <th className="w-16 text-center text-xs font-bold tracking-wider uppercase">Rank</th>
              <th className="text-xs font-bold tracking-wider uppercase">Algorithm Name</th>
              <th className="text-xs font-bold tracking-wider uppercase">{metricName}</th>
              {problemType === 'classification' && (
                <>
                  <th className="text-xs font-bold tracking-wider uppercase">Accuracy</th>
                  <th className="text-xs font-bold tracking-wider uppercase">Precision</th>
                </>
              )}
              {problemType === 'regression' && (
                <>
                  <th className="text-xs font-bold tracking-wider uppercase">RMSE</th>
                  <th className="text-xs font-bold tracking-wider uppercase">MAE</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, idx) => {
              const rankColor = idx === 0 ? '#b54708' : '#8792a2';
              const isBest = idx === 0;
              
              return (
                <tr key={idx} className={isBest ? 'bg-[#fffaeb]' : ''}>
                  <td className="text-center font-bold" style={{ color: rankColor }}>
                    #{idx + 1}
                  </td>
                  <td className="font-semibold text-[#1a1f36] flex items-center gap-2">
                    {row.model}
                    {isBest && <span className="bg-[#f59e0b] text-white px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide">Leading</span>}
                  </td>
                  <td className="font-mono font-bold text-[#635bff]">
                    {problemType === 'classification' 
                      ? (row.metrics.f1_score * 100).toFixed(2) + '%' 
                      : (row.metrics.r2).toFixed(4)}
                  </td>
                  
                  {problemType === 'classification' && (
                    <>
                      <td className="font-mono text-[#4f566b]">{row.metrics.accuracy ? (row.metrics.accuracy * 100).toFixed(2) + '%' : '-'}</td>
                      <td className="font-mono text-[#4f566b]">{row.metrics.precision ? (row.metrics.precision * 100).toFixed(2) + '%' : '-'}</td>
                    </>
                  )}
                  
                  {problemType === 'regression' && (
                    <>
                      <td className="font-mono text-[#4f566b]">{row.metrics.rmse ? row.metrics.rmse.toFixed(4) : '-'}</td>
                      <td className="font-mono text-[#4f566b]">{row.metrics.mae ? row.metrics.mae.toFixed(4) : '-'}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
