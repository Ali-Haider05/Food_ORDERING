import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-14 ${className}`}>
      {Icon && (
        <div className="w-20 h-20 rounded-3xl bg-theme-purple border border-theme-lavender/30 flex items-center justify-center text-theme-lavender mb-6 shadow-lavender-glow">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <h3 className="text-2xl font-black text-theme-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-theme-white-muted max-w-md mb-8 leading-relaxed font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
