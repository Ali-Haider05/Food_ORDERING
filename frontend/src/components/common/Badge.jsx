import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    purple: 'bg-theme-lavender/15 text-theme-lavender border-theme-lavender/30',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    blue: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    rose: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    default: 'bg-[#131A2B] text-white border-theme-lavender/25',
  };

  const dotColors = {
    purple: 'bg-theme-lavender',
    green: 'bg-emerald-400',
    orange: 'bg-orange-400',
    amber: 'bg-amber-400',
    blue: 'bg-sky-400',
    rose: 'bg-rose-400',
    default: 'bg-theme-lavender',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-bold',
    md: 'text-xs px-3 py-1 gap-2 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md tracking-wide ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[variant] || 'bg-theme-lavender'}`} />}
      {children}
    </span>
  );
};

export default Badge;
