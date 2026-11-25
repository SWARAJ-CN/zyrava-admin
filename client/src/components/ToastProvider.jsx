import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, ring: "border-emerald-400/25", iconColor: "text-emerald-400" },
  error: { icon: AlertTriangle, ring: "border-rose-400/25", iconColor: "text-rose-400" },
  info: { icon: Info, ring: "border-cyan-400/25", iconColor: "text-cyan-400" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    ({ title, description, type = "info" }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current.slice(-3), { id, title, description, type }]);
      setTimeout(() => dismiss(id), 4_500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const tone = TONES[toast.type] ?? TONES.info;
            const Icon = tone.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${tone.ring} bg-[#0d0d15]/95 p-4 shadow-2xl backdrop-blur-xl`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.iconColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-0.5 text-xs leading-relaxed text-default-400">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="rounded-lg p-1 text-default-500 transition hover:bg-white/5 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
