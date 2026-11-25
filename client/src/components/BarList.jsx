import { formatNumber } from "../lib/format";
import { EmptyState } from "./EmptyState";

export function BarList({
  items = [],
  showVisitors = false,
  renderLabel,
  emptyTitle = "No data in this range",
  max: maxOverride,
  color = "from-violet-500 to-fuchsia-400",
}) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} className="py-8" />;
  }

  const max = maxOverride ?? Math.max(...items.map((item) => item.count ?? 0), 1);

  return (
    <div className="space-y-3.5">
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} className="group">
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <div className="min-w-0 truncate text-[13px] text-default-300">
              {renderLabel ? renderLabel(item) : item.name}
            </div>
            <div className="shrink-0 text-right text-xs tabular-nums text-default-500">
              <span className="font-medium text-default-300">{formatNumber(item.count)}</span>
              {showVisitors && item.visitors !== undefined ? (
                <span className="ml-1.5 text-[10px] text-default-600">
                  · {formatNumber(item.visitors)} visitors
                </span>
              ) : null}
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-default-100/[0.07]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
              style={{ width: `${Math.max(2, ((item.count ?? 0) / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
