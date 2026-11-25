import { Pagination } from "@heroui/react";
import { formatNumber } from "../lib/format";

export function PaginationBar({ page = 1, pages = 1, total = 0, limit = 20, onChange }) {
  if (!total) return null;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-default-500">
        Showing <span className="font-medium text-default-300">{formatNumber(first)}</span>–
        <span className="font-medium text-default-300">{formatNumber(last)}</span> of{" "}
        <span className="font-medium text-default-300">{formatNumber(total)}</span>
      </p>
      {pages > 1 ? (
        <Pagination
          size="sm"
          showControls
          total={pages}
          page={page}
          onChange={onChange}
          color="primary"
          variant="flat"
        />
      ) : null}
    </div>
  );
}
