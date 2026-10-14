'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastCtx = createContext<{
  show: (message: string, type?: Toast['type']) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function show(message: string, type: Toast['type'] = 'info') {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glow-card min-w-[280px] rounded-2xl px-5 py-3 text-sm font-medium shadow-2xl ${
              t.type === 'success' ? 'border-emerald-500/40 text-emerald-300' :
              t.type === 'error' ? 'border-red-500/40 text-red-300' :
              'border-cyan-500/40 text-cyan-300'
            }`}
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            {t.type === 'success' ? '✅ ' : t.type === 'error' ? '❌ ' : 'ℹ️ '}
            {t.message}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}
