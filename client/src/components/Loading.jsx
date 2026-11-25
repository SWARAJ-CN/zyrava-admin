import { Card, CardBody, Skeleton } from "@heroui/react";

export function PageSkeleton({ cards = 4, rows = 1 }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <Card key={index} className="border border-white/[0.06] bg-content1/70 shadow-none">
            <CardBody className="p-5">
              <Skeleton className="h-3 w-24 rounded-lg" />
              <Skeleton className="mt-3 h-7 w-20 rounded-lg" />
              <Skeleton className="mt-4 h-3 w-32 rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>
      <Card className="border border-white/[0.06] bg-content1/70 shadow-none">
        <CardBody className="p-5">
          <Skeleton className="h-4 w-36 rounded-lg" />
          <Skeleton className="mt-2 h-3 w-64 rounded-lg" />
          <Skeleton className="mt-5 h-64 w-full rounded-2xl" />
        </CardBody>
      </Card>
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} className="border border-white/[0.06] bg-content1/70 shadow-none">
          <CardBody className="space-y-3 p-5">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-xl px-2 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-40 rounded-lg" />
            <Skeleton className="h-2.5 w-28 rounded-lg" />
          </div>
          <Skeleton className="h-3 w-24 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
