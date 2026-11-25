import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/12 text-violet-300">
          <Compass className="h-6 w-6" />
        </div>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-default-500">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
          This page does not exist
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-default-500">
          The route you opened is not part of the admin console.
        </p>
        <Button as={Link} to="/" color="primary" variant="flat" className="mt-6">
          Back to overview
        </Button>
      </div>
    </div>
  );
}
