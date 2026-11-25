import { Inbox } from "lucide-react";
import clsx from "clsx";

export function EmptyState({ title = "Nothing here yet", description, action, className }) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-content1/30 px-6 py-12 text-center",
        className
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-default-100/10 text-default-500">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-default-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
