import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import { useApi } from "../lib/useApi";
import { formatDateTime } from "../lib/format";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { PaginationBar } from "./PaginationBar";

const statuses = {
  created: ["Awaiting payment", "default"],
  authorized: ["Confirming payment", "warning"],
  captured: ["Paid", "success"],
  failed: ["Failed", "danger"],
  order_failed: ["Checkout unavailable", "danger"],
  refunded: ["Refunded", "secondary"],
  partially_refunded: ["Partially refunded", "warning"],
};
const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format((value ?? 0) / 100);

export function UserPaymentsTab({ userId }) {
  const [page, setPage] = useState(1);
  const { data, loading, error, refresh } = useApi(
    `/users/${userId}/payments`,
    {
      params: { page, limit: 10 },
    },
  );
  return (
    <section
      className="mt-4 min-w-0 space-y-4"
      aria-label="User payment history"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Payment history</h3>
          <p className="mt-1 text-xs text-default-500">
            Payments made by this user, including support contributions and past
            customizations. Pending and failed attempts are not confirmed
            payments.
          </p>
        </div>
        <Button size="sm" variant="flat" onPress={refresh} isLoading={loading}>
          Refresh
        </Button>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : loading ? (
        <p role="status" className="py-8 text-sm text-default-500">
          Loading payments…
        </p>
      ) : data?.items.length ? (
        <div className="space-y-3">
          {data.items.map((payment) => {
            const donation = payment.purpose === "donation";
            const gift = payment.purpose === "customization_gift";
            const [label, color] = statuses[payment.paymentStatus] ?? [
              payment.paymentStatus,
              "default",
            ];
            return (
              <article
                key={payment.id}
                className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="break-words text-sm font-semibold">
                      {payment.title}
                    </h4>
                    <p className="mt-1 text-xs text-default-500">
                      {formatDateTime(payment.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <strong className="text-sm">
                      {money(payment.amount, payment.currency)}
                    </strong>
                    <Chip size="sm" variant="flat" color={color}>
                      {label}
                    </Chip>
                  </div>
                </div>
                <p className="mt-4 break-words text-sm">
                  <span className="text-default-500">What it’s for: </span>
                  {donation
                    ? "Optional support for Zyrava (Buy A Mug)"
                    : gift
                      ? `Save and send a customization to ${payment.recipient?.name || "a removed account"}`
                      : "Save and apply a personal customization"}
                  .
                </p>
                {gift && payment.recipient ? (
                  <p className="mt-1 break-all text-xs text-default-500">
                    {[payment.recipient.email, payment.recipient.phone]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-default-500">
                  {donation
                    ? payment.fulfillmentStatus === "fulfilled"
                      ? "Support received"
                      : "Support not confirmed"
                    : payment.fulfillmentStatus === "fulfilled"
                      ? gift
                        ? "Customization sent"
                        : "Customization saved"
                      : "Customization not saved"}
                  {payment.fulfilledAt
                    ? ` · ${formatDateTime(payment.fulfilledAt)}`
                    : ""}
                </p>
                {payment.amountRefunded > 0 ? (
                  <p className="mt-2 text-xs text-warning">
                    {money(payment.amountRefunded, payment.currency)} refunded
                  </p>
                ) : null}
                <details className="mt-3 text-xs text-default-500">
                  <summary className="cursor-pointer py-1">
                    Payment details
                  </summary>
                  <dl className="mt-2 space-y-2">
                    <div>
                      <dt>Order ID</dt>
                      <dd className="break-all font-mono">
                        {payment.orderId || "No order created"}
                      </dd>
                    </div>
                    <div>
                      <dt>Payment ID</dt>
                      <dd className="break-all font-mono">
                        {payment.paymentId || "No payment recorded"}
                      </dd>
                    </div>
                    <div>
                      <dt>Last checked</dt>
                      <dd>{formatDateTime(payment.lastCheckedAt)}</dd>
                    </div>
                  </dl>
                </details>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No payments yet"
          description="This user has not started a payment."
          className="py-8"
        />
      )}
      {!loading && !error && data ? (
        <PaginationBar
          page={data.page}
          pages={data.pages}
          total={data.total}
          limit={data.limit}
          onChange={setPage}
        />
      ) : null}
    </section>
  );
}
