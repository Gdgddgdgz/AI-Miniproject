import React, { memo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ActualVsPredicted = ({ predictions }) => {
  if (!predictions || predictions.length === 0) return null;

  const actuals = predictions.map(p => p.actual);
  const minVal = Math.min(...actuals);
  const maxVal = Math.max(...actuals);
  const padding = (maxVal - minVal) * 0.1;

  return (
    <div className="h-80 w-full flex flex-col">
      <h3 className="text-base font-bold mb-1 text-[#1a1f36]">Prediction Variance</h3>
      <p className="text-sm text-[#4f566b] mb-4">
        Compares the model's predictions against the actual truth. Points closer to a straight diagonal line indicate higher accuracy.
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
          <XAxis type="number" dataKey="actual" name="Actual Truth" domain={[minVal - padding, maxVal + padding]} stroke="#8792a2" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis type="number" dataKey="predicted" name="Model Prediction" domain={[minVal - padding, maxVal + padding]} stroke="#8792a2" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: '#e3e8ee' }}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e3e8ee', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#635bff', fontWeight: 600 }}
          />
          <Scatter name="Data Points" data={predictions} fill="#635bff" fillOpacity={0.6} line={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(ActualVsPredicted);
