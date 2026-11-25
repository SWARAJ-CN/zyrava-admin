import { Card, CardBody } from "@heroui/react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import clsx from "clsx";
import { formatNumber } from "../lib/format";

const TONES = {
  violet: { icon: "bg-violet-500/12 text-violet-300", glow: "from-violet-500/10" },
  cyan: { icon: "bg-cyan-500/12 text-cyan-300", glow: "from-cyan-500/10" },
  pink: { icon: "bg-fuchsia-500/12 text-fuchsia-300", glow: "from-fuchsia-500/10" },
  amber: { icon: "bg-amber-500/12 text-amber-300", glow: "from-amber-500/10" },
  emerald: { icon: "bg-emerald-500/12 text-emerald-300", glow: "from-emerald-500/10" },
  blue: { icon: "bg-blue-500/12 text-blue-300", glow: "from-blue-500/10" },
};

function Change({ value }) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return null;
  const number = Number(value);
  const Icon = number > 0 ? ArrowUpRight : number < 0 ? ArrowDownRight : Minus;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
        number > 0
          ? "bg-emerald-500/10 text-emerald-400"
          : number < 0
            ? "bg-rose-500/10 text-rose-400"
            : "bg-default-100/10 text-default-400"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(number)}%
    </span>
  );
}

export function StatCard({ label, value, icon, tone = "violet", hint, change, className }) {
  const palette = TONES[tone] ?? TONES.violet;
  return (
    <Card
      className={clsx(
        "group relative overflow-hidden border border-white/[0.06] bg-content1/70 shadow-card transition-colors hover:border-white/[0.11]",
        className
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl",
          palette.glow
        )}
      />
      <CardBody className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-default-500">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
              {typeof value === "number" ? formatNumber(value) : value}
            </p>
          </div>
          <div className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", palette.icon)}>
            {icon}
          </div>
        </div>
        <div className="mt-3 flex min-h-5 items-center gap-2 text-xs text-default-500">
          <Change value={change} />
          {hint ? <span className="truncate">{hint}</span> : null}
        </div>
      </CardBody>
    </Card>
  );
}
