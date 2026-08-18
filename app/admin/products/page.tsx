import Link from "next/link";

import { listProducts } from "@/app/lib/admin-data";
import { formatPrice } from "@/app/lib/format";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { FlashMessage } from "@/components/admin/FlashMessage";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import {
  AdminLink,
  Card,
  EmptyState,
  ErrorPanel,
  Num,
  PageHeader,
  TableWrap,
  Td,
  Th,
} from "@/components/admin/ui";

const PAGE_SIZE = 20;

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const params = await searchParams;

  const page = Number(params.page ?? 0) || 0;
  const search = typeof params.search === "string" ? params.search : undefined;

  const result = await listProducts({ page, size: PAGE_SIZE, search });

  return (
    <>
      <PageHeader
        title="Products"
        description="The catalogue a flash sale draws from. Inventory here is the ceiling on what any sale may allocate."
        actions={
          <AdminLink href="/admin/products/new" variant="primary">
            New product
          </AdminLink>
        }
      />

      <FlashMessage />

      {!result.ok ? (
        <ErrorPanel
          message={result.message}
          hint="Products are served by catalog-service through the gateway."
        />
      ) : (
        <Card
          padded={false}
          actions={<SearchInput placeholder="Search SKU or title…" />}
          title="All products"
        >
          {result.data.items.length === 0 ? (
            <EmptyState
              icon="📦"
              title={search ? "Nothing matched that search" : "No products yet"}
              description={
                search
                  ? "Try a different SKU or title."
                  : "Add a product before you can schedule a flash sale against it."
              }
              action={
                !search && (
                  <AdminLink href="/admin/products/new" variant="primary">
                    Add the first product
                  </AdminLink>
                )
              }
            />
          ) : (
            <>
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th>Category</Th>
                    <Th align="right">Base price</Th>
                    <Th align="right">Inventory</Th>
                    <Th align="right">Live sales</Th>
                    <Th align="right" />
                  </tr>
                </thead>
                <tbody>
                  {result.data.items.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <Td>
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg"
                            aria-hidden="true"
                          >
                            {product.emoji}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="block truncate font-semibold text-slate-900 hover:text-blue-600"
                            >
                              {product.title}
                            </Link>
                            <Num className="text-slate-400">{product.sku}</Num>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {product.category}
                        </span>
                      </Td>
                      <Td align="right">
                        <Num>{formatPrice(product.basePrice)}</Num>
                      </Td>
                      <Td align="right">
                        <Num
                          className={
                            product.totalInventory === 0
                              ? "text-red-600"
                              : "text-slate-900"
                          }
                        >
                          {product.totalInventory}
                        </Num>
                      </Td>
                      <Td align="right">
                        {product.activeSaleCount > 0 ? (
                          <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-200">
                            {product.activeSaleCount}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton
                            id={product.id}
                            title={product.title}
                            activeSaleCount={product.activeSaleCount}
                          />
                        </div>
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
