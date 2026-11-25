import { formatNumber } from "../lib/format";

export function ChartTooltip({ active, payload, label, labelFormatter, valueFormatter }) {
  if (!active || !payload?.length) return null;
  const heading = labelFormatter ? labelFormatter(label) : label;

  return (
    <div className="min-w-36 rounded-xl border border-white/10 bg-[#0b0b12]/95 px-3 py-2.5 shadow-2xl backdrop-blur-xl">
      {heading ? <p className="mb-1.5 text-[11px] font-medium text-default-500">{heading}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey ?? item.name} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-default-400">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color ?? item.payload?.fill ?? "#a78bfa" }}
              />
              {item.name}
            </span>
            <span className="font-semibold tabular-nums text-white">
              {valueFormatter ? valueFormatter(item.value) : formatNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
