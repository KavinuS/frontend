import { notFound } from "next/navigation";

import {
  getFlashSale,
  listOrders,
  listProducts,
  reconcile,
} from "@/app/lib/admin-data";
import { discountPercent, formatDateTime, formatPrice, shortId } from "@/app/lib/format";
import { FlashMessage } from "@/components/admin/FlashMessage";
import { ReconciliationPanel } from "@/components/admin/ReconciliationPanel";
import { SaleForm } from "@/components/admin/SaleForm";
import { SaleStatusActions } from "@/components/admin/SaleStatusActions";
import {
  AdminLink,
  Card,
  EmptyState,
  ErrorPanel,
  Num,
  OrderPill,
  PageHeader,
  SalePill,
  TableWrap,
  Td,
  Th,
} from "@/components/admin/ui";

/**
 * Everything about one sale: its lifecycle controls, the oversell proof, and
 * the orders it produced.
 *
 * The reconciliation call needs `allocatedStock`, which lives in
 * catalog-service's schema — order-service cannot read another service's
 * tables. So the sale is fetched first and its allocation handed across. The
 * service boundary is visible right here in the call sequence, which is a
 * feature: it is the same reason the two figures can disagree at all.
 */
export default async function SaleDetailPage({
  params,
}: PageProps<"/admin/sales/[id]">) {
  const { id } = await params;

  const sale = await getFlashSale(id);

  if (!sale.ok) {
    if (sale.status === 404) notFound();

    return (
      <>
        <PageHeader title="Flash sale" />
        <ErrorPanel message={sale.message} />
      </>
    );
  }

  const editable = sale.data.status === "SCHEDULED";

  // Only fetched once the allocation is known. The product list is needed only
  // to render the edit form, so it is skipped entirely for a running sale.
  const [check, orders, products] = await Promise.all([
    reconcile(sale.data.id, sale.data.allocatedStock),
    listOrders({ page: 0, size: 10, flashSaleId: sale.data.id }),
    editable ? listProducts({ page: 0, size: 100 }) : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader
        title={sale.data.productName}
        description={`Sale #${sale.data.id} · ${sale.data.sku} · ${formatPrice(
          sale.data.discountPrice,
        )} (${discountPercent(sale.data.originalPrice, sale.data.discountPrice)}% off ${formatPrice(sale.data.originalPrice)})`}
        actions={
          <AdminLink href="/admin/sales" variant="secondary">
            Back to sales
          </AdminLink>
        }
      />

      <FlashMessage />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl" aria-hidden="true">
              {sale.data.emoji}
            </span>
            <div>
              <SalePill status={sale.data.status} />
              <p className="mt-1.5 text-xs text-slate-500">
                {formatDateTime(sale.data.startTime)} to{" "}
                {formatDateTime(sale.data.endTime)} (UTC)
              </p>
            </div>
          </div>

          <SaleStatusActions sale={sale.data} size="md" />
        </div>

        {sale.data.status === "ACTIVE" && !sale.data.preWarmed && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <strong className="font-semibold">No Redis counter.</strong> This
            sale is marked ACTIVE but has nothing to sell from — every checkout
            will be rejected. Run <em>Re-publish metadata</em> from the sales
            list to restore it.
          </div>
        )}
      </Card>

      {!check.ok ? (
        <ErrorPanel
          message={check.message}
          hint="Reconciliation is computed by order-service."
        />
      ) : (
        <ReconciliationPanel data={check.data} status={sale.data.status} />
      )}

      <div className="mt-4">
        {!orders.ok ? (
          <ErrorPanel message={orders.message} />
        ) : (
          <Card
            title="Latest orders for this sale"
            padded={false}
            actions={
              <AdminLink
                href={`/admin/orders?flashSaleId=${sale.data.id}`}
                variant="secondary"
              >
                View all
              </AdminLink>
            }
          >
            {orders.data.items.length === 0 ? (
              <EmptyState
                icon="🧾"
                title="No orders yet"
                description={
                  sale.data.status === "SCHEDULED"
                    ? "This sale has not opened, so nothing can have been bought."
                    : "Nobody has checked out against this sale."
                }
              />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Buyer</Th>
                    <Th align="right">Qty</Th>
                    <Th align="right">Total</Th>
                    <Th>Status</Th>
                    <Th>Placed</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.data.items.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <Td>
                        <Num className="text-slate-500">
                          {shortId(order.id)}
                        </Num>
                      </Td>
                      <Td>
                        <Num className="text-slate-400">
                          {shortId(order.userId)}
                        </Num>
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
        )}
      </div>

      {editable && products?.ok && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Edit this sale
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-slate-500">
            Only possible while the sale is SCHEDULED. Once it is activated the
            Redis counter becomes the authority on what remains, and changing
            the allocation underneath it would invalidate the reconciliation
            above.
          </p>
          <SaleForm products={products.data.items} sale={sale.data} />
        </div>
      )}
    </>
  );
}
