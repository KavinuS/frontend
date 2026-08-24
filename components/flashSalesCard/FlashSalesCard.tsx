import Link from "next/link";

import { discountPercent, formatPrice } from "@/app/lib/format";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { SaleStatusBadge } from "@/components/ui/Badge";
import StockBar from "@/components/ui/StockBar";
import Thumb from "@/components/ui/Thumb";
import { Product } from "@/types/product";

/**
 * A sale, as a card, for the home page grid.
 *
 * The catalogue page shows the same sales as table rows — that is the right
 * shape for comparing twenty of them. Three featured drops on a landing page
 * want the picture bigger, so this keeps the card, drawn the system's way:
 * ruled top and bottom, no border radius, no shadow, and no hover lift.
 */
export default function FlashSaleCard({ product }: { product: Product }) {
  const soldOut = product.remainingStock <= 0;
  const scheduled = product.status === "SCHEDULED";
  const ended = product.status === "ENDED";
  const discount = discountPercent(product.originalPrice, product.salePrice);

  return (
    <article className="flex flex-col border-t-2 border-fx-divider pt-4">
      <Link href={`/sales/${product.sku}`} className="relative block">
        <Thumb
          emoji={product.emoji}
          height={200}
          dimmed={soldOut || ended}
        />

        <div className="absolute left-3 top-3">
          <SaleStatusBadge status={product.status} />
        </div>

        {discount > 0 && (
          <div className="absolute right-0 top-3 bg-fx-accent px-2.5 py-1 font-heading text-xs font-extrabold text-fx-bg">
            −{discount}%
          </div>
        )}
      </Link>

      <p className="fx-mono fx-muted mt-4 text-[11px]">
        {product.sku} · {product.category}
      </p>

      <h3 className="mt-1.5 text-lg">
        <Link
          href={`/sales/${product.sku}`}
          className="text-fx-ink hover:text-fx-accent"
        >
          {product.name}
        </Link>
      </h3>

      <p className="fx-muted mt-1 line-clamp-2 text-sm">{product.tagline}</p>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="font-heading text-2xl font-extrabold">
          {formatPrice(product.salePrice)}
        </span>
        <span className="fx-muted text-sm line-through">
          {formatPrice(product.originalPrice)}
        </span>
      </div>

      {/* mt-auto pins the stock bar and action to the bottom so cards of
          different text lengths still line up in the grid. */}
      <div className="mt-auto pt-4">
        <StockBar
          remaining={product.remainingStock}
          total={product.totalStock}
        />

        <div className="mt-4">
          {scheduled || ended ? (
            <p className="fx-muted border-y border-fx-divider py-2.5 text-center font-heading text-sm font-extrabold">
              {scheduled ? "Not started yet" : "Sale closed"}
            </p>
          ) : (
            <AddToCartButton
              flashSaleId={product.id}
              disabled={soldOut}
              fullWidth
              label={soldOut ? "Sold out" : "Add to cart"}
            />
          )}
        </div>
      </div>
    </article>
  );
}
