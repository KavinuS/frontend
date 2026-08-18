import { listCategories } from "@/app/lib/admin-data";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <>
      <PageHeader
        title="New product"
        description="Products are the catalogue. A flash sale is scheduled against one and may never allocate more units than it holds."
      />

      {/* A failed category lookup is not worth blocking on — the field falls
          back to whatever the operator types. */}
      <ProductForm categories={categories.ok ? categories.data : []} />
    </>
  );
}
