import { Product } from "@/types/product";

type FlashSaleCardProps = {
  product: Product;
};

export default function FlashSaleCard({ product }: FlashSaleCardProps) {

  // Guard against totalStock === 0, which would make this NaN and emit `width: NaN%`.
  const stockPercentage =
    product.totalStock > 0
      ? Math.min(100, Math.max(0, (product.remainingStock / product.totalStock) * 100))
      : 0;

  const soldOut = product.remainingStock <= 0;

  const discount =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.salePrice) / product.originalPrice) * 100,
        )
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

      <div className="mb-3 flex items-center justify-between">

        <p className="text-sm font-semibold tracking-wide text-orange-600">
          {soldOut ? "SOLD OUT" : "LIVE DEAL"}
        </p>

        {discount > 0 && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-green-200">
            -{discount}%
          </span>
        )}

      </div>

      <h2 className="text-3xl font-bold text-slate-900">
        {product.name}
      </h2>

      <div className="mt-4 flex items-baseline gap-4">

        <span className="text-slate-400 line-through">
          ${product.originalPrice}
        </span>

        <span className="text-3xl font-bold text-green-600">
          ${product.salePrice}
        </span>

      </div>

      <p className="mt-5 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">
          {product.remainingStock}
        </span>{" "}
        of {product.totalStock} items remaining
      </p>

      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-3 rounded-full bg-orange-500"
          style={{
            width: `${stockPercentage}%`,
          }}
        />

      </div>

      <button
        disabled={soldOut}
        className="mt-6 w-full rounded-xl bg-orange-500 py-4 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        {soldOut ? "Sold Out" : "Buy Now ⚡"}
      </button>

    </div>
  );
}
