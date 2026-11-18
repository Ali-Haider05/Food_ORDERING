import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F19] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none tracking-wide';

  const variants = {
    primary: 'bg-theme-violet hover:bg-theme-violet-hover active:bg-[#6D28D9] text-white focus:ring-theme-lavender border border-theme-lavender/25 shadow-sm',
    secondary: 'bg-[#131A2B] hover:bg-[#1E2842] text-white border border-theme-lavender/25 hover:border-theme-lavender/50 focus:ring-theme-lavender shadow-sm',
    outline: 'border border-theme-lavender/30 hover:border-theme-lavender text-white bg-transparent hover:bg-[#131A2B] focus:ring-theme-lavender',
    ghost: 'text-theme-lavender hover:text-white hover:bg-[#131A2B] focus:ring-theme-lavender/20',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus:ring-rose-400',
    glass: 'bg-[#131A2B]/80 hover:bg-[#131A2B] text-white border border-theme-lavender/20 focus:ring-theme-violet'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
    icon: 'p-2.5 rounded-2xl'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
