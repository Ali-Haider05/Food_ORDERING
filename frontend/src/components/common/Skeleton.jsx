import React from 'react';

export const FoodCardSkeleton = () => {
  return (
    <div className="bg-theme-purple rounded-3xl p-4 border border-theme-lavender/15 shadow-purple-card animate-pulse flex flex-col h-full">
      <div className="w-full h-48 bg-theme-purple-dark rounded-2xl mb-4 relative overflow-hidden" />
      <div className="flex justify-between items-center mb-2">
        <div className="h-4 bg-theme-purple-light rounded-md w-1/3" />
        <div className="h-4 bg-theme-purple-light rounded-md w-1/6" />
      </div>
      <div className="h-6 bg-theme-purple-light rounded-md w-3/4 mb-2" />
      <div className="h-3.5 bg-theme-purple-dark rounded-md w-full mb-1" />
      <div className="h-3.5 bg-theme-purple-dark rounded-md w-4/5 mb-6" />
      <div className="mt-auto pt-3 border-t border-theme-lavender/10 flex items-center justify-between">
        <div className="h-7 bg-theme-purple-light rounded-lg w-20" />
        <div className="h-10 bg-theme-purple-light rounded-2xl w-28" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-theme-lavender/10">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-theme-purple-light rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="bg-theme-purple p-6 rounded-3xl border border-theme-lavender/15 shadow-purple-card animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-theme-purple-light rounded w-28" />
        <div className="w-10 h-10 rounded-2xl bg-theme-purple-light" />
      </div>
      <div className="h-8 bg-theme-purple-light rounded w-36 mb-2" />
      <div className="h-3.5 bg-theme-purple-dark rounded w-24" />
    </div>
  );
};
