import Link from "next/link";

import { prewarmActiveSales } from "@/app/actions/admin";
import { listFlashSales } from "@/app/lib/admin-data";
import { SALE_STATUSES, type SaleStatus } from "@/app/lib/admin-types";
import { discountPercent, formatDateTime, formatPrice } from "@/app/lib/format";
import { FlashMessage } from "@/components/admin/FlashMessage";
import { SaleStatusActions } from "@/components/admin/SaleStatusActions";
import {
  AdminLink,
  Card,
  EmptyState,
  ErrorPanel,
  Num,
  PageHeader,
  SalePill,
  TableWrap,
  Td,
  Th,
} from "@/components/admin/ui";

/**
 * The sale board.
 *
 * Two stock figures appear side by side and they mean different things.
 * `remaining` is the Postgres projection, which is deliberately allowed to
 * trail during a sale; `live` is the Redis counter, which is the only number
 * customers are actually buying against. Showing both makes the lag visible
 * instead of leaving an operator to wonder which one is lying.
 */
export default async function AdminSalesPage({
  searchParams,
}: PageProps<"/admin/sales">) {
  const params = await searchParams;

  const requested = typeof params.status === "string" ? params.status : null;
  const status = SALE_STATUSES.includes(requested as SaleStatus)
    ? (requested as SaleStatus)
    : undefined;

  const result = await listFlashSales(status);

  return (
    <>
      <PageHeader
        title="Flash sales"
        description="Scheduling, activation, and teardown. Activating a sale is what pre-warms its Redis counter and opens it to real checkouts."
        actions={
          <>
            <form action={prewarmActiveSales}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                title="Re-publishes metadata for every ACTIVE sale. Uses SETNX, so an existing stock counter is left alone — safe to run mid-sale."
              >
                Re-publish metadata
              </button>
            </form>
            <AdminLink href="/admin/sales/new" variant="primary">
              Schedule a sale
            </AdminLink>
          </>
        }
      />

      <FlashMessage />

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusTab label="All" href="/admin/sales" active={!status} />
        {SALE_STATUSES.map((option) => (
          <StatusTab
            key={option}
            label={option}
            href={`/admin/sales?status=${option}`}
            active={status === option}
          />
        ))}
      </div>

      {!result.ok ? (
        <ErrorPanel
          message={result.message}
          hint="Flash sales are served by catalog-service through the gateway."
        />
      ) : (
        <Card padded={false}>
          {result.data.length === 0 ? (
            <EmptyState
              icon="⚡"
              title={status ? `No ${status} sales` : "No sales scheduled"}
              description={
                status
                  ? "Try a different status filter."
                  : "Schedule a sale against an existing product to get started."
              }
              action={
                !status && (
                  <AdminLink href="/admin/sales/new" variant="flash">
                    Schedule the first sale
                  </AdminLink>
                )
              }
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Status</Th>
                  <Th align="right">Price</Th>
                  <Th align="right">Allocated</Th>
                  <Th align="right">Live</Th>
                  <Th align="right">Remaining</Th>
                  <Th>Window (UTC)</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody>
                {result.data.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg"
                          aria-hidden="true"
                        >
                          {sale.emoji}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/sales/${sale.id}`}
                            className="block truncate font-semibold text-slate-900 hover:text-blue-600"
                          >
                            {sale.productName}
                          </Link>
                          <Num className="text-slate-400">{sale.sku}</Num>
                        </div>
                      </div>
                    </Td>

                    <Td>
                      <SalePill status={sale.status} />
                      {sale.status === "ACTIVE" && !sale.preWarmed && (
                        // ACTIVE with no counter means nothing can be sold.
                        // Worth shouting about — it is invisible from the
                        // storefront, which just shows a sale that never works.
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          no Redis counter
                        </p>
                      )}
                    </Td>

                    <Td align="right">
                      <Num className="font-semibold text-orange-600">
                        {formatPrice(sale.discountPrice)}
                      </Num>
                      <p className="text-[11px] text-slate-400">
                        was {formatPrice(sale.originalPrice)} ·{" "}
                        {discountPercent(sale.originalPrice, sale.discountPrice)}
                        % off
                      </p>
                    </Td>

                    <Td align="right">
                      <Num>{sale.allocatedStock}</Num>
                    </Td>

                    <Td align="right">
                      {sale.liveStock === null ? (
                        <span className="text-xs text-slate-300" title="No Redis counter — the sale was never pre-warmed, or has been torn down.">
                          —
                        </span>
                      ) : (
                        <Num className="font-semibold text-slate-900">
                          {sale.liveStock}
                        </Num>
                      )}
                    </Td>

                    <Td align="right">
                      <Num className="text-slate-500">{sale.remainingStock}</Num>
                    </Td>

                    <Td>
                      <p className="whitespace-nowrap text-xs text-slate-600">
                        {formatDateTime(sale.startTime)}
                      </p>
                      <p className="whitespace-nowrap text-xs text-slate-400">
                        to {formatDateTime(sale.endTime)}
                      </p>
                    </Td>

                    <Td align="right">
                      <div className="flex items-center justify-end">
                        <SaleStatusActions sale={sale} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      )}
    </>
  );
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
