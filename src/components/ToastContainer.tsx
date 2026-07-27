import React from "react";
import { useAuction } from "../context/AuctionContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuction();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start gap-2.5">
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-snug">{toast.message}</p>
            </div>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
