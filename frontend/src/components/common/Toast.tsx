import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {toasts.map((toast) => {
          const type = toast.type || 'success';
          const iconMap = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />,
            info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />,
            warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />,
            error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />,
          };

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-4 bg-white border border-stone-200/90 rounded-xl shadow-modal animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {iconMap[type]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
