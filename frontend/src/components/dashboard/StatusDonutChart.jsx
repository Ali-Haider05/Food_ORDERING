import React from 'react';
import { PieChart } from 'lucide-react';

const COLORS = [
  '#7C3AED', // Violet
  '#C4B5FD', // Lavender
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#38bdf8', // Sky
  '#f43f5e', // Rose
  '#a855f7', // Purple
];

const StatusDonutChart = ({ data = [], title = 'Category Breakdown' }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-theme-purple rounded-3xl p-6 sm:p-7 border border-theme-lavender/20 shadow-purple-card space-y-6 text-theme-white">
      <div className="flex items-center justify-between border-b border-theme-lavender/10 pb-4">
        <div>
          <h3 className="font-black text-theme-white text-xl tracking-tight">{title}</h3>
          <p className="text-xs text-theme-lavender mt-1 font-medium">
            Active menu distribution & inventory volume
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-theme-purple-dark border border-theme-lavender/20 flex items-center justify-center text-theme-lavender">
          <PieChart className="w-5 h-5" />
        </div>
      </div>

      {/* Progress Bars representation */}
      <div className="space-y-4 pt-2">
        {data.map((item, idx) => {
          const color = COLORS[idx % COLORS.length];
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <div key={item.category || idx} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-theme-white flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  {item.category}
                </span>
                <span className="text-theme-lavender font-bold">
                  {item.count} items ({percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-theme-purple-dark overflow-hidden border border-theme-lavender/10">
                <div
                  className="h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusDonutChart;
