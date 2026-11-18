import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatPrice } from '../../utils/format';

const RevenueChart = ({ data = [] }) => {
  const [activeDay, setActiveDay] = useState(null);

  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);

  return (
    <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm space-y-5 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme-lavender/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-white text-lg tracking-tight">Weekly Campus Revenue</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-theme-lavender/15 text-theme-lavender border border-theme-lavender/25">
              +18.4%
            </span>
          </div>
          <p className="text-xs text-theme-lavender mt-0.5 font-normal">
            Daily order volume across BIIT Campus & Rawalpindi delivery zones
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-theme-lavender bg-[#0B0F19] border border-theme-lavender/20 px-3 py-1.5 rounded-xl">
          <TrendingUp className="w-4 h-4 text-theme-lavender" />
          <span>Peak: Fri & Sat</span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-56 flex items-end justify-between gap-2.5 sm:gap-4 pt-6 pb-2 px-1">
        {data.map((item, idx) => {
          const heightPercent = Math.max(14, Math.round((item.revenue / maxRevenue) * 100));
          const isHovered = activeDay === item.day;

          return (
            <div
              key={item.day}
              onMouseEnter={() => setActiveDay(item.day)}
              onMouseLeave={() => setActiveDay(null)}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-[#0B0F19] border border-theme-lavender/30 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-lg pointer-events-none whitespace-nowrap">
                  <p className="text-theme-lavender font-extrabold text-xs">{formatPrice(item.revenue)}</p>
                  <p className="text-[10px] text-theme-white-muted">{item.orders} dispatched orders</p>
                </div>
              )}

              {/* Bar */}
              <div className="w-full max-w-[40px] bg-[#0B0F19] rounded-xl relative overflow-hidden flex items-end h-full border border-theme-lavender/10">
                <div
                  className={`w-full rounded-xl transition-all duration-300 ${
                    isHovered
                      ? 'bg-theme-lavender'
                      : idx >= 4
                      ? 'bg-theme-violet'
                      : 'bg-[#2A344E]'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day Label */}
              <span
                className={`text-[11px] mt-2.5 font-bold uppercase tracking-wider transition-colors ${
                  isHovered ? 'text-white' : 'text-theme-white-muted'
                }`}
              >
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart Footer Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-theme-lavender/10 text-xs">
        <div>
          <span className="text-theme-lavender uppercase tracking-wider text-[10px] font-bold block">Weekly Volume</span>
          <span className="text-sm sm:text-base font-black text-white">
            {formatPrice(data.reduce((sum, d) => sum + d.revenue, 0))}
          </span>
        </div>
        <div>
          <span className="text-theme-lavender uppercase tracking-wider text-[10px] font-bold block">Meals Dispatched</span>
          <span className="text-sm sm:text-base font-black text-white">
            {data.reduce((sum, d) => sum + d.orders, 0)} meals
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-theme-lavender uppercase tracking-wider text-[10px] font-bold block">Fulfillment Rate</span>
          <span className="text-sm sm:text-base font-black text-emerald-400">96.8%</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
