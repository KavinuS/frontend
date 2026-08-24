"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { formatPrice } from "@/app/lib/format";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Countdown from "@/components/sales/Countdown";
import { SaleStatusBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Rule } from "@/components/ui/Section";
import StockBar from "@/components/ui/StockBar";
import Thumb from "@/components/ui/Thumb";
import type { Product } from "@/types/product";

/**
 * The whole board in one table: live, scheduled and closed together.
 *
 * The previous version of this page split the catalogue into a grid of live
 * cards and a separate "upcoming" section further down, which meant you could
 * not compare a live price against a scheduled one without scrolling. A single
 * sorted table is the design's answer — one row per sale, one column per thing
 * you would compare, and the status as a tag rather than as a section boundary.
 *
 * Client-side because the filter and the search box are local state. Filtering
 * through the URL would make each keystroke a server round trip for a list that
 * is already fully in memory.
 */

type Filter = "ALL" | "LIVE" | "SCHEDULED" | "CLOSED";

/** ENDED and EXHAUSTED are one bucket to a shopper: you cannot buy it. */
const matches = (product: Product, filter: Filter) => {
  switch (filter) {
    case "ALL":
      return true;
    case "LIVE":
      return product.status === "ACTIVE";
    case "SCHEDULED":
      return product.status === "SCHEDULED";
    case "CLOSED":
      return product.status === "ENDED" || product.status === "EXHAUSTED";
  }
};

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "CLOSED", label: "Closed" },
];

export default function SalesTable({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  // Scopes the radio group to this instance. Two tables on one page would
  // otherwise share a `name` and fight over which one is checked.
  const groupName = useId();
  const searchId = useId();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return products.filter((product) => {
      if (!matches(product, filter)) return false;
      if (!needle) return true;

      return (
        product.name.toLowerCase().includes(needle) ||
        product.sku.toLowerCase().includes(needle)
      );
    });
  }, [products, filter, query]);

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center gap-4.5">
        <div className="fx-seg">
          {filters.map((option) => (
            <label key={option.value} className="fx-seg-opt">
              <input
                type="radio"
                name={groupName}
                checked={filter === option.value}
                onChange={() => setFilter(option.value)}
              />
              {option.label}{" "}
              {products.filter((product) => matches(product, option.value)).length}
            </label>
          ))}
        </div>

        <div className="fx-field ml-auto min-w-[260px] flex-1 sm:flex-none">
          <label htmlFor={searchId} className="sr-only">
            Search sales
          </label>
          <input
            id={searchId}
            className="fx-input"
            type="search"
            placeholder="Search SKU or name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <Rule animate className="mt-6" />

      {visible.length === 0 ? (
        <p className="fx-muted border-b-2 border-fx-divider py-16 text-center">
          Nothing matches that filter.
        </p>
      ) : (
        <>
          {/* Below `md` the seven columns cannot be read without a horizontal
              scroll, so the same rows are restacked as ruled blocks. */}
          <ul className="md:hidden">
            {visible.map((product, index) => (
              <SaleCard key={product.id} product={product} index={index} />
            ))}
          </ul>

          <table className="fx-table hidden md:table">
            <thead>
              <tr>
                <th className="w-24">Item</th>
                <th>Product</th>
                <th>Status</th>
                <th className="min-w-[130px]">Stock</th>
                <th>Ends in</th>
                <th className="text-right">Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((product, index) => (
                <SaleRow key={product.id} product={product} index={index} />
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

/**
 * Everything a row needs to know about a sale, derived once so the table and
 * the stacked mobile list cannot disagree about whether something is buyable.
 */
function saleState(product: Product) {
  const soldOut = product.remainingStock <= 0;
  const scheduled = product.status === "SCHEDULED";
  const closed = product.status === "ENDED" || soldOut;

  return { soldOut, scheduled, closed, buyable: !scheduled && !closed };
}

function SaleRow({ product, index }: { product: Product; index: number }) {
  const { soldOut, scheduled, closed, buyable } = saleState(product);

  return (
    <tr>
      <td>
        <Link href={`/sales/${product.sku}`} tabIndex={-1} aria-hidden="true">
          <Thumb emoji={product.emoji} width={72} height={56} dimmed={closed} />
        </Link>
      </td>

      <td>
        <Link
          href={`/sales/${product.sku}`}
          className="font-heading text-[17px] font-extrabold text-fx-ink hover:text-fx-accent"
        >
          {product.name}
        </Link>
        <div className="fx-mono fx-muted mt-0.75 text-[11px]">
          {product.sku} · {product.category}
        </div>
      </td>

      <td>
        <SaleStatusBadge status={product.status} />
      </td>

      <td>
        {scheduled ? (
          <span className="fx-muted text-xs">
            {product.totalStock.toLocaleString("en-US")} pre-warmed
          </span>
        ) : (
          <StockBar
            remaining={product.remainingStock}
            total={product.totalStock}
            delayMs={300 + index * 80}
          />
        )}
      </td>

      <td>
        <Countdown
          endsAt={product.endsAt}
          className={closed || scheduled ? "fx-muted" : ""}
        />
      </td>

      <td className="text-right">
        <Price product={product} />
      </td>

      <td className="text-right">
        <RowAction product={product} soldOut={soldOut} buyable={buyable} />
      </td>
    </tr>
  );
}

function SaleCard({ product, index }: { product: Product; index: number }) {
  const { soldOut, scheduled, closed, buyable } = saleState(product);

  return (
    <li className="flex gap-4 border-b border-fx-divider py-5">
      <Link href={`/sales/${product.sku}`} tabIndex={-1} aria-hidden="true">
        <Thumb emoji={product.emoji} width={72} height={56} dimmed={closed} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/sales/${product.sku}`}
            className="font-heading text-[17px] font-extrabold text-fx-ink"
          >
            {product.name}
          </Link>
          <SaleStatusBadge status={product.status} />
        </div>

        <div className="fx-mono fx-muted mt-0.75 text-[11px]">
          {product.sku} · {product.category}
        </div>

        <div className="mt-3">
          {scheduled ? (
            <span className="fx-muted text-xs">
              {product.totalStock.toLocaleString("en-US")} pre-warmed
            </span>
          ) : (
            <StockBar
              remaining={product.remainingStock}
              total={product.totalStock}
              delayMs={300 + index * 80}
            />
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Price product={product} />
          <Countdown
            endsAt={product.endsAt}
            className={`text-xs ${closed || scheduled ? "fx-muted" : ""}`}
          />
        </div>

        <div className="mt-3">
          <RowAction product={product} soldOut={soldOut} buyable={buyable} />
        </div>
      </div>
    </li>
  );
}

function Price({ product }: { product: Product }) {
  return (
    <>
      <span className="font-heading text-[17px] font-extrabold">
        {formatPrice(product.salePrice)}
      </span>{" "}
      <span className="fx-muted text-xs line-through">
        {formatPrice(product.originalPrice)}
      </span>
    </>
  );
}

/**
 * The design puts "Remind me" on scheduled rows. There is no reminder service
 * behind it, and a button that does nothing is worse than one that goes
 * somewhere — so the slot keeps the secondary-button shape and links to the
 * detail page, which is where you would come back from anyway.
 */
function RowAction({
  product,
  soldOut,
  buyable,
}: {
  product: Product;
  soldOut: boolean;
  buyable: boolean;
}) {
  if (buyable) {
    return (
      <AddToCartButton
        flashSaleId={product.id}
        disabled={soldOut}
        label={soldOut ? "Sold out" : "Add to cart"}
      />
    );
  }

  return (
    <ButtonLink href={`/sales/${product.sku}`} variant="secondary">
      {product.status === "SCHEDULED" ? "View drop" : "View sale"}
    </ButtonLink>
  );
}
