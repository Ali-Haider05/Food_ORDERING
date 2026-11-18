import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  trendLabel = 'vs last week',
  icon: Icon,
  colorScheme = 'purple',
}) => {
  const isPositive = trend && trend > 0;

  return (
    <div className="bg-theme-purple rounded-3xl p-6 border border-theme-lavender/20 shadow-purple-card hover:border-theme-lavender/40 transition-all duration-300 text-theme-white">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase tracking-widest text-theme-lavender">
          {title}
        </span>
        {Icon && (
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold bg-theme-purple-dark border border-theme-lavender/25 text-theme-lavender shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        {prefix && <span className="text-xl font-black text-theme-lavender">{prefix}</span>}
        <span className="text-3xl sm:text-4xl font-black text-theme-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-sm font-bold text-theme-lavender">{suffix}</span>}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center font-black px-2 py-0.5 rounded-lg border ${
              isPositive 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-theme-lavender font-semibold">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
