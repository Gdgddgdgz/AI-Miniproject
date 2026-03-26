import React from 'react';

const MetricsCard = ({ title, value, type = 'default', subtitle }) => {
  return (
    <div className="saas-card p-5 group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[#4f566b] text-sm font-medium">{title}</h4>
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-bold tracking-tight text-[#1a1f36]">{value}</span>
      </div>
      {subtitle && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#8792a2]">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
