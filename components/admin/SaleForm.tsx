"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveFlashSale, type AdminFormState } from "@/app/actions/admin";
import type { AdminFlashSale, AdminProduct } from "@/app/lib/admin-types";
import { formatPrice, toDateTimeLocalUtc } from "@/app/lib/format";
import {
  FormError,
  FormSuccess,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/admin/FormControls";
import { Card } from "@/components/admin/ui";

/**
 * Schedule or reschedule a flash sale.
 *
 * The product picker drives two live constraints — sale price must be below
 * base price, allocation may not exceed inventory — which the backend enforces
 * and this mirrors so the operator sees the ceiling before submitting rather
 * than after.
 *
 * Editing is only reachable for a SCHEDULED sale. Once ACTIVE, the Redis
 * counter is the authority on what remains, and rewriting the allocation
 * underneath it would invalidate the reconciliation that proves nothing
 * oversold.
 */
export function SaleForm({
  products,
  sale,
}: {
  products: AdminProduct[];
  /** Absent when scheduling a new sale. */
  sale?: AdminFlashSale;
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(
    saveFlashSale,
    undefined,
  );

  const [productId, setProductId] = useState(
    sale ? String(sale.productId) : "",
  );

  const selected = products.find((p) => String(p.id) === productId);
  const editing = Boolean(sale);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {editing && <input type="hidden" name="id" value={sale!.id} />}

      {state?.message && <FormError message={state.message} />}
      {state?.success && <FormSuccess message={state.success} />}

      <Card title="Product">
        <SelectField
          name="productId"
          label="Product"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          errors={state?.errors?.productId}
          // Changing the product would move the sale to a different inventory
          // pool and a different base price, invalidating both constraints
          // already agreed when it was scheduled.
          disabled={editing}
          required
        >
          <option value="" disabled>
            Choose a product…
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.emoji} {product.title} ({product.sku}) —{" "}
              {formatPrice(product.basePrice)}, {product.totalInventory} in stock
            </option>
          ))}
        </SelectField>

        {/*
          A disabled control is omitted from FormData entirely, so the select
          above would post nothing while editing and the action would reject the
          submission for a missing product. This carries the value instead.
        */}
        {editing && (
          <input type="hidden" name="productId" value={sale!.productId} />
        )}

        {selected && (
          <dl className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Base price
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold text-slate-900">
                {formatPrice(selected.basePrice)}
              </dd>
              <p className="text-xs text-slate-500">
                The sale price has to come in below this.
              </p>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Inventory
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold text-slate-900">
                {selected.totalInventory}
              </dd>
              <p className="text-xs text-slate-500">
                The most this sale may allocate.
              </p>
            </div>
          </dl>
        )}
      </Card>

      <Card title="Offer">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="discountPrice"
            label="Sale price"
            type="number"
            step="0.01"
            min="0.01"
            max={selected ? selected.basePrice - 0.01 : undefined}
            defaultValue={sale?.discountPrice}
            errors={state?.errors?.discountPrice}
            hint={
              selected
                ? `Must be below ${formatPrice(selected.basePrice)}.`
                : "Choose a product to see the ceiling."
            }
            required
          />

          <TextField
            name="allocatedStock"
            label="Units to allocate"
            type="number"
            step="1"
            min="1"
            max={selected?.totalInventory}
            defaultValue={sale?.allocatedStock}
            errors={state?.errors?.allocatedStock}
            hint={
              selected
                ? `Up to ${selected.totalInventory}. This becomes the Redis counter on activation.`
                : "Becomes the Redis counter when the sale is activated."
            }
            required
          />
        </div>
      </Card>

      <Card
        title="Window"
        description="Both times are UTC. The Lua reservation script checks the window on every checkout, so a sale outside it is rejected before any stock is touched."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="startTime"
            label="Opens (UTC)"
            type="datetime-local"
            defaultValue={sale ? toDateTimeLocalUtc(sale.startTime) : undefined}
            errors={state?.errors?.startTime}
            required
          />

          <TextField
            name="endTime"
            label="Closes (UTC)"
            type="datetime-local"
            defaultValue={sale ? toDateTimeLocalUtc(sale.endTime) : undefined}
            errors={state?.errors?.endTime}
            required
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Scheduling a window does not open the sale. It stays SCHEDULED until
          you activate it, which is the step that writes the stock counter into
          Redis.
        </p>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton variant="flash">
          {editing ? "Save changes" : "Schedule sale"}
        </SubmitButton>

        <Link
          href="/admin/sales"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
