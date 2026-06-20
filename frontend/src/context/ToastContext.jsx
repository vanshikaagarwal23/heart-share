import { createContext, useContext, useCallback, useState } from "react";
 
const ToastContext = createContext(null);
 
let idCounter = 0;
 
const STYLES = {
  success: "bg-green-50 border-green-200 text-green-700",
  error:   "bg-red-50 border-red-200 text-red-600",
  info:    "bg-blue-50 border-blue-200 text-blue-700",
};
 
const ICONS = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
};
 
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
 
  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
 
  const push = useCallback((message, type = "info", duration = 4000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);
 
  const toast = {
    success: (msg, duration) => push(msg, "success", duration),
    error:   (msg, duration) => push(msg, "error", duration),
    info:    (msg, duration) => push(msg, "info", duration),
    dismiss: remove,
  };
 
  return (
    <ToastContext.Provider value={toast}>
      {children}
 
      {/* Toast stack — fixed bottom-right on desktop, bottom-center on mobile */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[100] flex flex-col gap-2 w-[90%] sm:w-auto sm:max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`flex items-start gap-2 text-sm border rounded-lg px-4 py-3 shadow-md cursor-pointer animate-[fadeIn_0.2s_ease-out] ${STYLES[t.type]}`}
          >
            <span className="font-bold">{ICONS[t.type]}</span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
 
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}