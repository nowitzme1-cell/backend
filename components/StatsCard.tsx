
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subtitle, trend, icon: Icon, color }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend === 'up' ? '+12.5%' : '-3.2%'}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{label}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {subtitle && <span className="text-slate-500 text-xs">{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
