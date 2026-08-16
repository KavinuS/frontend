import Link from "next/link";

import { discountPercent, formatPrice } from "@/app/lib/format";
import { SaleStatusBadge } from "@/components/ui/Badge";
import StockBar from "@/components/ui/StockBar";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { Product } from "@/types/product";

export default function FlashSaleCard({ product }: { product: Product }) {
  const soldOut = product.remainingStock <= 0;
  const scheduled = product.status === "SCHEDULED";
  const discount = discountPercent(product.originalPrice, product.salePrice);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5">

      {/* Image stand-in. The seed catalogue has no photography, so the emoji
          carries the product identity on a tinted field. */}
      <Link
        href={`/sales/${product.sku}`}
        className="relative flex h-44 items-center justify-center bg-linear-to-br from-slate-100 to-slate-200"
      >
        <span
          aria-hidden="true"
          className="text-6xl transition-transform duration-300 group-hover:scale-110"
        >
          {product.emoji}
        </span>

        <div className="absolute left-4 top-4">
          <SaleStatusBadge status={product.status} />
        </div>

        {discount > 0 && (
          <div className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            −{discount}%
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {product.category}
        </p>

        <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
          <Link href={`/sales/${product.sku}`} className="hover:text-blue-600">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
          {product.tagline}
        </p>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="text-2xl font-bold text-slate-900">
            {formatPrice(product.salePrice)}
          </span>
          <span className="text-sm text-slate-400 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        </div>

        {/* mt-auto pins the stock bar and action to the bottom so cards of
            different text lengths still line up in the grid. */}
        <div className="mt-auto pt-5">
          <StockBar
            remaining={product.remainingStock}
            total={product.totalStock}
          />

          <div className="mt-4">
            {scheduled ? (
              <p className="rounded-xl bg-slate-50 py-2.5 text-center text-sm font-semibold text-slate-500">
                Not started yet
              </p>
            ) : (
              <AddToCartButton
                sku={product.sku}
                disabled={soldOut}
                variant="flash"
                fullWidth
                label={soldOut ? "Sold out" : "Add to cart"}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
