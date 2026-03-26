import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FeatureImportance = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-[#8792a2] text-sm font-medium">
      Feature importance analysis not supported for this algorithm.
    </div>
  );

  return (
    <div className="h-80 w-full flex flex-col">
      <h3 className="text-base font-bold mb-1 text-[#1a1f36]">Feature Importance Drivers</h3>
      <p className="text-sm text-[#4f566b] mb-4">
        Highlights which data features had the strongest influence on the model's predictions.
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#8792a2" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis dataKey="feature" type="category" width={110} stroke="#4f566b" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: '#f7f9fc' }}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e3e8ee', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#1a1f36', fontWeight: 600, fontSize: '0.875rem' }}
            formatter={(val) => [`${(val * 100).toFixed(2)}%`, 'Weight']}
          />
          <Bar dataKey="importance" fill="#635bff" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(FeatureImportance);
