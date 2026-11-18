import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  className = '',
  containerClassName = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-theme-white uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-theme-lavender pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={inputType}
          className={`w-full bg-[#0E1424] border rounded-2xl py-3 text-sm text-white placeholder:text-theme-white-muted/50 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-theme-lavender focus:border-theme-lavender disabled:bg-[#0B0F19] disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : 'pl-4'
          } ${isPassword ? 'pr-12' : 'pr-4'} ${
            error
              ? 'border-rose-500 focus:ring-rose-500 bg-rose-950/20 text-white'
              : 'border-theme-lavender/20 hover:border-theme-lavender/40'
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-theme-lavender hover:text-white focus:outline-none p-1 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-400 font-bold animate-fade-in">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-theme-lavender">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
