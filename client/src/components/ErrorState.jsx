import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";

export function ErrorState({ message, onRetry, className }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] px-6 py-12 text-center ${className ?? ""}`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-400">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">Could not load this view</p>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-default-500">{message}</p>
      {onRetry ? (
        <Button
          className="mt-4"
          size="sm"
          variant="flat"
          color="danger"
          startContent={<RefreshCw className="h-4 w-4" />}
          onPress={onRetry}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
