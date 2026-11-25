import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatDayShort, formatNumber } from "../lib/format";
import { ChartTooltip } from "./ChartTooltip";
import { EmptyState } from "./EmptyState";

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-default-500">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function TrafficChart({ data = [], showUsers = true, height = 300 }) {
  const hasData = data.some((row) => (row.visits ?? 0) + (row.visitors ?? 0) + (row.users ?? 0) > 0);

  if (!hasData) {
    return (
      <div style={{ height }} className="grid place-items-center">
        <EmptyState title="No traffic recorded in this range" className="w-full py-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <LegendDot color="#a78bfa" label="Visits" />
        <LegendDot color="#22d3ee" label="Unique visitors" />
        {showUsers ? <LegendDot color="#f472b6" label="Signups" /> : null}
      </div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.34} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 6"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.12)"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayShort}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
              dy={8}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => formatNumber(value)}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            {showUsers ? (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
            ) : null}
            <Tooltip
              cursor={{ stroke: "rgba(167, 139, 250, 0.3)", strokeWidth: 1 }}
              content={
                <ChartTooltip
                  labelFormatter={(value) => formatDayShort(value)}
                  valueFormatter={(value) => formatNumber(value)}
                />
              }
            />
            <Legend wrapperStyle={{ display: "none" }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="visits"
              name="Visits"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#visitsGradient)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#0b0b12" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="visitors"
              name="Unique visitors"
              stroke="#22d3ee"
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#0b0b12" }}
            />
            {showUsers ? (
              <Bar
                yAxisId="right"
                dataKey="users"
                name="Signups"
                fill="#f472b6"
                opacity={0.55}
                barSize={9}
                radius={[4, 4, 0, 0]}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
