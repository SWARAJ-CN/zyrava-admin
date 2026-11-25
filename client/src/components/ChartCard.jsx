import { Card, CardBody } from "@heroui/react";
import clsx from "clsx";

export function ChartCard({ title, description, action, children, className, bodyClassName }) {
  return (
    <Card
      className={clsx(
        "border border-white/[0.06] bg-content1/70 shadow-card",
        className
      )}
    >
      <CardBody className={clsx("p-5", bodyClassName)}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-[15px] font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-default-500">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        {children}
      </CardBody>
    </Card>
  );
}
