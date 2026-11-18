import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'success', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-slide-up transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-theme-purple border-emerald-400/40 text-theme-white shadow-violet-glow'
                : toast.type === 'error'
                ? 'bg-theme-purple border-rose-500/40 text-theme-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                : toast.type === 'warning'
                ? 'bg-theme-purple border-amber-400/40 text-theme-white shadow-sm'
                : 'bg-theme-purple border-theme-lavender/30 text-theme-white'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1 text-xs">
              {toast.title && <p className="font-black text-white text-sm">{toast.title}</p>}
              <p className={toast.title ? 'text-stone-300 font-medium mt-0.5 leading-snug' : 'font-bold text-white'}>{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-theme-lavender hover:text-white transition p-1 -mr-1 rounded-lg"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
