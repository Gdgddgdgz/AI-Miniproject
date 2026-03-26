import React, { memo } from 'react';

const ConfusionMatrix = ({ matrix, labels }) => {
  if (!matrix || !labels) return null;

  let maxVal = 0;
  matrix.forEach(row => row.forEach(val => { if(val > maxVal) maxVal = val; }));

  const getColor = (val) => {
    if (val === 0) return '#f7f9fc';
    const intensity = Math.max(0.05, val / maxVal);
    return `rgba(99, 91, 255, ${intensity})`; // Stripe blurple
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-base font-bold mb-1 text-[#1a1f36]">Confusion Matrix</h3>
      <p className="text-sm text-[#4f566b] mb-8 text-center max-w-sm">
        Shows how often the model's predictions matched the actual truth. The diagonal represents correct predictions.
      </p>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-2"></th>
              <th colSpan={labels.length} className="text-[#8792a2] pb-4 text-xs font-bold uppercase tracking-wider">Predicted Value</th>
            </tr>
            <tr>
              <th className="p-2"></th>
              {labels.map((l, i) => (
                <th key={`h-${i}`} className="p-2 text-xs font-semibold text-[#4f566b] w-14 text-center break-words">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={`r-${i}`}>
                {i === 0 && (
                  <td rowSpan={labels.length} className="text-[#8792a2] pr-4 text-xs font-bold uppercase tracking-wider align-middle" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    Actual Truth
                  </td>
                )}
                <td className="p-2 text-xs font-semibold text-[#4f566b] text-right pr-4 break-words w-14">{labels[i]}</td>
                
                {row.map((val, j) => {
                  const isHigh = val > maxVal * 0.5;
                  return (
                    <td key={`c-${i}-${j}`} className="p-1">
                      <div 
                        className="w-12 h-12 flex items-center justify-center rounded-md text-sm font-semibold transition-transform hover:scale-105"
                        style={{ 
                          backgroundColor: getColor(val), 
                          color: isHigh ? '#ffffff' : '#1a1f36',
                          border: val === 0 ? '1px solid #e3e8ee' : '1px solid transparent'
                        }}
                        title={`Actual: ${labels[i]}\nPredicted: ${labels[j]}`}
                      >
                        {val}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(ConfusionMatrix);
