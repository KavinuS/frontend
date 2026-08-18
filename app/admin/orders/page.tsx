import Link from "next/link";

import { listOrders } from "@/app/lib/admin-data";
import { ORDER_STATUSES, type OrderStatus } from "@/app/lib/admin-types";
import { formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import {
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

const PAGE_SIZE = 25;

/**
 * Read-only, and that is a design decision rather than an unfinished feature.
 *
 * An order is the record of a completed financial event. Editing or deleting
 * one from an admin screen would destroy the audit trail the whole architecture
 * exists to keep honest — the reconciliation on the sale page is only
 * meaningful because nothing here can be quietly adjusted. Corrections belong
 * in a refund flow, which writes a new row rather than altering an old one.
 */
export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  const params = await searchParams;

  const page = Number(params.page ?? 0) || 0;
  const search = typeof params.search === "string" ? params.search : undefined;

  const requestedStatus =
    typeof params.status === "string" ? params.status : null;
  const status = ORDER_STATUSES.includes(requestedStatus as OrderStatus)
    ? (requestedStatus as OrderStatus)
    : undefined;

  const flashSaleId = Number(params.flashSaleId) || undefined;

  const result = await listOrders({
    page,
    size: PAGE_SIZE,
    status,
    flashSaleId,
    search,
  });

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every checkout that reached the persistence queue. Read-only by design — an order is an audit record, not an editable row."
      />

      {flashSaleId && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-900">
            Filtered to flash sale{" "}
            <span className="font-mono font-bold">#{flashSaleId}</span>.
          </p>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-blue-700 underline hover:text-blue-900"
          >
            Clear filter
          </Link>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusTab
          label="All"
          href={hrefWithStatus(params, null)}
          active={!status}
        />
        {ORDER_STATUSES.map((option) => (
          <StatusTab
            key={option}
            label={option.replace("_", " ")}
            href={hrefWithStatus(params, option)}
            active={status === option}
          />
        ))}
      </div>

      {!result.ok ? (
        <ErrorPanel
          message={result.message}
          hint="Orders are served by order-service through the gateway."
        />
      ) : (
        <Card
          padded={false}
          title="All orders"
          actions={<SearchInput placeholder="Search SKU or product…" />}
        >
          {result.data.items.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="No orders match"
              description="Try clearing the status filter or the search term."
            />
          ) : (
            <>
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Product</Th>
                    <Th>Buyer</Th>
                    <Th align="right">Qty</Th>
                    <Th align="right">Unit</Th>
                    <Th align="right">Total</Th>
                    <Th>Status</Th>
                    <Th>Placed</Th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.items.map((order) => (
                    <tr key={order.id} className="align-top hover:bg-slate-50">
                      <Td>
                        <Num
                          className="text-slate-600"
                          // The full UUID on hover: the short form is for
                          // scanning, but a support ticket needs the whole
                          // thing.
                        >
                          <span title={order.id}>{shortId(order.id)}</span>
                        </Num>
                        <p
                          className="mt-0.5 max-w-[10rem] truncate text-[11px] text-slate-400"
                          title={`Idempotency key: ${order.idempotencyKey}`}
                        >
                          {order.idempotencyKey}
                        </p>
                      </Td>

                      <Td>
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true">{order.emoji}</span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {order.productName}
                            </p>
                            <Link
                              href={`/admin/sales/${order.flashSaleId}`}
                              className="font-mono text-[11px] text-blue-600 hover:text-blue-700"
                            >
                              {order.sku} · sale #{order.flashSaleId}
                            </Link>
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <Num className="text-slate-400">
                          <span title={order.userId}>
                            {shortId(order.userId)}
                          </span>
                        </Num>
                      </Td>

                      <Td align="right">
                        <Num>{order.quantity}</Num>
                      </Td>
                      <Td align="right">
                        <Num className="text-slate-500">
                          {formatPrice(order.unitPrice)}
                        </Num>
                      </Td>
                      <Td align="right">
                        <Num className="font-semibold text-slate-900">
                          {formatPrice(order.totalAmount)}
                        </Num>
                      </Td>

                      <Td>
                        <OrderPill status={order.status} />
                        {order.failureReason && (
                          <p className="mt-1 max-w-[12rem] text-[11px] text-red-600">
                            {order.failureReason}
                          </p>
                        )}
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

              <Pagination
                page={result.data.page}
                totalPages={result.data.totalPages}
                total={result.data.total}
                size={result.data.size}
              />
            </>
          )}
        </Card>
      )}
    </>
  );
}

/**
 * Preserves the other filters when switching status. Building the href from
 * scratch would silently drop an active sale filter or search term, which
 * reads as the filter having been ignored.
 */
function hrefWithStatus(
  params: Record<string, string | string[] | undefined>,
  status: OrderStatus | null,
) {
  const next = new URLSearchParams();

  for (const key of ["search", "flashSaleId"]) {
    const value = params[key];
    if (typeof value === "string" && value) next.set(key, value);
  }

  if (status) next.set("status", status);

  const query = next.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

function StatusTab({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}
