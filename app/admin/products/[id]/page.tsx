import { notFound } from "next/navigation";

import { getProduct, listCategories } from "@/app/lib/admin-data";
import { formatDateTime } from "@/app/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminLink, ErrorPanel, PageHeader } from "@/components/admin/ui";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProduct(id),
    listCategories(),
  ]);

  if (!product.ok) {
    // A deleted or mistyped id is a 404, not an error panel — the record is
    // genuinely not there, and the not-found page says so better.
    if (product.status === 404) notFound();

    return (
      <>
        <PageHeader title="Edit product" />
        <ErrorPanel message={product.message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={product.data.title}
        description={`SKU ${product.data.sku} · added ${formatDateTime(product.data.createdAt)}`}
        actions={
          <AdminLink href="/admin/products" variant="secondary">
            Back to products
          </AdminLink>
        }
      />

      {product.data.activeSaleCount > 0 && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong className="font-semibold">
            {product.data.activeSaleCount} scheduled or active sale
          </strong>{" "}
          references this product. Lowering the inventory below what those sales
          have already allocated will not claw stock back — the Redis counters
          were sized when each sale was activated.
        </div>
      )}

      <ProductForm
        product={product.data}
        categories={categories.ok ? categories.data : []}
      />
    </>
  );
}
