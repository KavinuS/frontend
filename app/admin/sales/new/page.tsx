import { listProducts } from "@/app/lib/admin-data";
import { SaleForm } from "@/components/admin/SaleForm";
import {
  AdminLink,
  EmptyState,
  ErrorPanel,
  PageHeader,
} from "@/components/admin/ui";

export default async function NewSalePage() {
  // The picker needs the whole catalogue, not a page of it. 100 is the
  // backend's hard cap; beyond that this screen would need its own search.
  const products = await listProducts({ page: 0, size: 100 });

  return (
    <>
      <PageHeader
        title="Schedule a flash sale"
        description="A sale reserves part of a product's inventory at a discount for a fixed window. It opens only when you activate it."
        actions={
          <AdminLink href="/admin/sales" variant="secondary">
            Back to sales
          </AdminLink>
        }
      />

      {!products.ok ? (
        <ErrorPanel message={products.message} />
      ) : products.data.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            icon="📦"
            title="No products to sell"
            description="A flash sale is always scheduled against a product. Add one first."
            action={
              <AdminLink href="/admin/products/new" variant="primary">
                Add a product
              </AdminLink>
            }
          />
        </div>
      ) : (
        <SaleForm products={products.data.items} />
      )}
    </>
  );
}
