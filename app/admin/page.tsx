import Link from "next/link";

import { getMetrics, listFlashSales } from "@/app/lib/admin-data";
import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import {
  AdminLink,
  Card,
  EmptyState,
  ErrorPanel,
  Num,
  OrderPill,
  PageHeader,
  TableWrap,
  Td,
  Th,
} from "@/components/admin/ui";

/**
 * The operational picture: order throughput, queue health, and every sale
 * currently able to take money.
 *
 * The two panels are fetched in parallel and rendered independently, so a
 * RabbitMQ outage costs the queue card and nothing else.
 */
export default async function AdminDashboardPage() {
  const [metrics, activeSales] = await Promise.all([
    getMetrics(),
    listFlashSales("ACTIVE"),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live order flow, persistence queue health, and the sales currently open for business."
        actions={<AutoRefresh />}
      />

      {!metrics.ok ? (
        <ErrorPanel
          message={metrics.message}
          hint="Order metrics come from order-service via the gateway. Check that both are up."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Orders"
              value={metrics.data.orders.total.toLocaleString()}
              caption={`${metrics.data.orders.confirmed.toLocaleString()} confirmed`}
            />
            <Stat
              label="Revenue"
              value={formatPrice(metrics.data.orders.revenue ?? 0)}
              caption="Confirmed orders only"
              tone="brand"
            />
            <Stat
              label="Awaiting write"
              value={metrics.data.orders.pending.toLocaleString()}
              caption="Reserved in Redis, not yet in Postgres"
              tone={metrics.data.orders.pending > 0 ? "warn" : "default"}
            />
            <Stat
              label="Failed"
              value={metrics.data.orders.failed.toLocaleString()}
              caption="Stock returned to the pool"
              tone={metrics.data.orders.failed > 0 ? "danger" : "default"}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card
              title="Persistence queue"
              description="Redis accepts checkouts faster than Postgres can persist them. A backlog is the design working; a backlog that stops draining is not."
              className="lg:col-span-1"
            >
              <dl className="space-y-3">
                <QueueRow
                  label="Queued"
                  value={metrics.data.queueDepth}
                  hint="Orders waiting to be written"
                />
                <QueueRow
                  label="Dead letters"
                  value={metrics.data.deadLetterDepth}
                  hint="Needs a human — stock returned, nobody got the goods"
                  danger={(metrics.data.deadLetterDepth ?? 0) > 0}
                />
                <QueueRow
                  label="Consumers"
                  value={metrics.data.consumers}
                  hint="Listeners attached to the queue"
                  danger={metrics.data.consumers === 0}
                />
              </dl>
            </Card>

            <Card
              title="Recent orders"
              padded={false}
              className="lg:col-span-2"
              actions={
                <AdminLink href="/admin/orders" variant="secondary">
                  View all
                </AdminLink>
              }
            >
              {metrics.data.recentOrders.length === 0 ? (
                <EmptyState
                  icon="🧾"
                  title="No orders yet"
                  description="Activate a flash sale and complete a checkout to see traffic here."
                />
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Order</Th>
                      <Th>Product</Th>
                      <Th align="right">Qty</Th>
                      <Th align="right">Total</Th>
                      <Th>Status</Th>
                      <Th>Placed</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <Td>
                          <Num className="text-slate-500">
                            {shortId(order.id)}
                          </Num>
                        </Td>
                        <Td>
                          <span className="mr-1.5" aria-hidden="true">
                            {order.emoji}
                          </span>
                          <span className="font-medium text-slate-900">
                            {order.productName}
                          </span>
                        </Td>
                        <Td align="right">
                          <Num>{order.quantity}</Num>
                        </Td>
                        <Td align="right">
                          <Num>{formatPrice(order.totalAmount)}</Num>
                        </Td>
                        <Td>
                          <OrderPill status={order.status} />
                        </Td>
                        <Td>
                          <span className="whitespace-nowrap text-xs text-slate-500">
                            {formatDateTime(order.createdAt)}
                          </span>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </Card>
          </div>
        </>
      )}

      <div className="mt-4">
        {!activeSales.ok ? (
          <ErrorPanel
            message={activeSales.message}
            hint="Flash sales come from catalog-service."
          />
        ) : (
          <Card
            title="Sales open right now"
            description="Live stock is read from the Redis counter, which is the only figure customers are actually buying against."
            padded={false}
            actions={
              <AdminLink href="/admin/sales" variant="secondary">
                Manage sales
              </AdminLink>
            }
          >
            {activeSales.data.length === 0 ? (
              <EmptyState
                icon="⚡"
                title="Nothing is live"
                description="Activate a scheduled sale to pre-warm its Redis counter and open it for checkout."
                action={
                  <AdminLink href="/admin/sales" variant="flash">
                    Go to flash sales
                  </AdminLink>
                }
              />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th align="right">Price</Th>
                    <Th align="right">Allocated</Th>
                    <Th align="right">Live stock</Th>
                    <Th align="right">Sold</Th>
                    <Th>Closes</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {activeSales.data.map((sale) => {
                    const sold = sale.soldUnits ?? 0;
                    const soldPercent =
                      sale.allocatedStock > 0
                        ? Math.min(100, (sold / sale.allocatedStock) * 100)
                        : 0;

                    return (
                      <tr key={sale.id} className="hover:bg-slate-50">
                        <Td>
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg" aria-hidden="true">
                              {sale.emoji}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {sale.productName}
                              </p>
                              <Num className="text-slate-400">{sale.sku}</Num>
                            </div>
                          </div>
                        </Td>
                        <Td align="right">
                          <Num className="font-semibold text-orange-600">
                            {formatPrice(sale.discountPrice)}
                          </Num>
                        </Td>
                        <Td align="right">
                          <Num>{sale.allocatedStock}</Num>
                        </Td>
                        <Td align="right">
                          {sale.liveStock === null ? (
                            // Not the same as zero. No counter means the sale
                            // is marked ACTIVE but Redis has nothing to sell
                            // from, which is a fault worth naming.
                            <span
                              className="text-xs font-semibold text-red-600"
                              title="ACTIVE with no Redis counter. Run 'Re-publish metadata' on the sales page."
                            >
                              not warmed
                            </span>
                          ) : (
                            <Num className="font-semibold text-slate-900">
                              {sale.liveStock}
                            </Num>
                          )}
                        </Td>
                        <Td align="right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <span
                                className="block h-full rounded-full bg-orange-500"
                                style={{ width: `${soldPercent}%` }}
                              />
                            </span>
                            <Num className="w-10 text-right">{sold}</Num>
                          </div>
                        </Td>
                        <Td>
                          <span className="whitespace-nowrap text-xs text-slate-500">
                            {formatDateTime(sale.endTime)}
                          </span>
                        </Td>
                        <Td align="right">
                          <Link
                            href={`/admin/sales/${sale.id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Inspect
                          </Link>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

const statTones = {
  default: "text-slate-900",
  brand: "text-blue-600",
  warn: "text-amber-600",
  danger: "text-red-600",
} as const;

function Stat({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption: string;
  tone?: keyof typeof statTones;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-2xl font-bold tabular-nums ${statTones[tone]}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

/**
 * A queue figure. `null` is rendered as "unknown", never as 0 — the backend
 * returns null when the broker could not be reached, and showing that as an
 * empty queue would read as perfect health at the exact moment it is worst.
 */
function QueueRow({
  label,
  value,
  hint,
  danger = false,
}: {
  label: string;
  value: number | null;
  hint: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <dt className="text-sm font-semibold text-slate-800">{label}</dt>
        <dd className="text-xs text-slate-500">{hint}</dd>
      </div>
      <span
        className={`shrink-0 font-mono text-lg font-bold tabular-nums ${
          value === null
            ? "text-slate-400"
            : danger
              ? "text-red-600"
              : "text-slate-900"
        }`}
      >
        {value === null ? "unknown" : value}
      </span>
    </div>
  );
}
