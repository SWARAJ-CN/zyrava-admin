import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "../lib/constants";
import { formatNumber } from "../lib/format";
import { ChartTooltip } from "./ChartTooltip";
import { EmptyState } from "./EmptyState";

export function DonutChart({ data = [], height = 210, label = "total" }) {
  const total = data.reduce((sum, item) => sum + (item.count ?? 0), 0);

  if (!data.length || total === 0) {
    return <EmptyState title="No data in this range" className="py-8" />;
  }

  return (
    <div>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={56}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={(value) => formatNumber(value)} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-2xl font-semibold text-foreground">{formatNumber(total)}</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-default-500">{label}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex min-w-0 items-center justify-between gap-2 text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5 text-default-400">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-default-500">{formatNumber(item.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
