import { AudioLines } from "lucide-react";
import clsx from "clsx";

export function Brand({ compact = false, className }) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-glow">
        <AudioLines className="h-5 w-5 text-white" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#07070b] bg-emerald-400" />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-none tracking-tight text-white">
            ZYRAVA
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-default-500">
            Admin console
          </p>
        </div>
      ) : null}
    </div>
  );
}
