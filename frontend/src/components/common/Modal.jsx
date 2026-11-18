import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Deep Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-theme-dark/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Centered Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-3xl royal-modal text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} animate-scale-in text-theme-white`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between p-6 pb-4 border-b border-theme-lavender/15 bg-theme-purple-dark/80">
              <div>
                {title && <h3 className="text-xl sm:text-2xl font-black text-theme-white tracking-tight">{title}</h3>}
                {subtitle && <p className="text-xs text-theme-lavender mt-1 font-medium">{subtitle}</p>}
              </div>
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-theme-lavender hover:bg-theme-purple-light hover:text-white transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6 bg-theme-purple/95">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
