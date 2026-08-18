"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveProduct, type AdminFormState } from "@/app/actions/admin";
import type { AdminProduct } from "@/app/lib/admin-types";
import {
  FormError,
  FormSuccess,
  SubmitButton,
  TextArea,
  TextField,
} from "@/components/admin/FormControls";
import { Card } from "@/components/admin/ui";

/**
 * Create and edit share one form.
 *
 * The only differences are the hidden `id`, the submit label, and whether the
 * SKU field carries a warning — so branching inside one component keeps the
 * two screens from drifting, which is how an edit form ends up missing a field
 * that create has.
 */
export function ProductForm({
  product,
  categories,
}: {
  /** Absent when creating. */
  product?: AdminProduct;
  /** Existing categories, offered as a datalist rather than a fixed select. */
  categories: string[];
}) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(
    saveProduct,
    undefined,
  );

  const editing = Boolean(product);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {editing && <input type="hidden" name="id" value={product!.id} />}

      {state?.message && <FormError message={state.message} />}
      {state?.success && <FormSuccess message={state.success} />}

      <Card title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="sku"
            label="SKU"
            defaultValue={product?.sku}
            placeholder="FX-AUDIO-001"
            errors={state?.errors?.sku}
            hint={
              editing
                ? "Changing this breaks existing storefront links and saved carts."
                : "Uppercase letters, digits, and dashes. Used in URLs and Redis keys."
            }
            // Uppercased as you type, so the pattern rule is never a surprise
            // at submit time.
            style={{ textTransform: "uppercase" }}
            required
          />

          <TextField
            name="emoji"
            label="Emoji"
            defaultValue={product?.emoji}
            placeholder="🎧"
            errors={state?.errors?.emoji}
            hint="Stands in for a product image throughout the app."
            required
          />

          <TextField
            name="title"
            label="Title"
            defaultValue={product?.title}
            placeholder="Aurora Wireless Headphones"
            errors={state?.errors?.title}
            required
          />

          {/*
            A datalist rather than a select. The options come from
            `SELECT DISTINCT category`, so on a fresh install the list is empty
            — a select would then offer nothing to choose and the form could
            never be submitted. This suggests what exists while still accepting
            a new name.
          */}
          <TextField
            name="category"
            label="Category"
            defaultValue={product?.category}
            list="product-categories"
            placeholder="Audio"
            errors={state?.errors?.category}
            hint="Pick an existing one or type a new one."
            required
          />
          <datalist id="product-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      </Card>

      <Card title="Copy">
        <div className="space-y-4">
          <TextField
            name="tagline"
            label="Tagline"
            defaultValue={product?.tagline}
            placeholder="Studio sound, thirty-hour battery."
            errors={state?.errors?.tagline}
            hint="One line, shown under the title on cards."
            required
          />

          <TextArea
            name="description"
            label="Description"
            defaultValue={product?.description}
            errors={state?.errors?.description}
            rows={4}
            required
          />

          <TextArea
            name="highlights"
            label="Highlights"
            defaultValue={product?.highlights.join("\n")}
            rows={4}
            hint="One per line. Blank lines are ignored."
            placeholder={"Active noise cancelling\n30-hour battery\nUSB-C fast charge"}
          />
        </div>
      </Card>

      <Card title="Pricing and stock">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="basePrice"
            label="Base price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={product?.basePrice}
            errors={state?.errors?.basePrice}
            hint="Every sale price must come in below this."
            required
          />

          <TextField
            name="totalInventory"
            label="Total inventory"
            type="number"
            step="1"
            min="0"
            defaultValue={product?.totalInventory}
            errors={state?.errors?.totalInventory}
            hint="The ceiling on what any single sale may allocate."
            required
          />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>
          {editing ? "Save changes" : "Create product"}
        </SubmitButton>

        <Link
          href="/admin/products"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
