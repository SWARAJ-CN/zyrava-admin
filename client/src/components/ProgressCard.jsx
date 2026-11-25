import { Card, CardBody } from "@heroui/react";
import clsx from "clsx";

export function ProgressCard({ title, description, icon, children, className }) {
  return (
    <Card className={clsx("border border-white/[0.06] bg-content1/70 shadow-card", className)}>
      <CardBody className="p-4">
        <div className="mb-2 flex items-start gap-2.5">
          {icon ? <span className="mt-0.5">{icon}</span> : null}
          <div className="min-w-0">
            <h3 className="font-display text-[13px] font-semibold text-foreground">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-[10px] leading-relaxed text-default-600">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">{children}</div>
      </CardBody>
    </Card>
  );
}
