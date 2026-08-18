"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

import { adminFetch, requireAdmin } from "@/app/lib/admin-api";
import type {
  AdminFlashSale,
  AdminProduct,
  AdminUser,
  SaleStatus,
} from "@/app/lib/admin-types";
import { SALE_STATUSES } from "@/app/lib/admin-types";
import { fromDateTimeLocalUtc } from "@/app/lib/format";

/**
 * Every mutation the admin console can perform.
 *
 * Each action calls `requireAdmin()` first. Server Actions are reachable as
 * plain POST requests — the layout that renders the form is not in the call
 * path — so the check in the layout secures navigation and nothing else. The
 * backend re-checks the role as well; this is defence in depth, not the only
 * defence.
 */

export type AdminFormState =
  | {
      /** Form-level failure, shown as a banner above the fields. */
      message?: string;
      /** Confirmation after a successful in-place save. */
      success?: string;
      /** Per-field messages, keyed by input name. */
      errors?: Record<string, string[] | undefined>;
      /** The backend's `ErrorResponse.code`, for callers that branch on it. */
      code?: string;
    }
  | undefined;

// ---------------------------------------------------------------- schemas --

/**
 * Mirrors the Bean Validation annotations on `AdminDtos.ProductRequest`.
 *
 * Duplicating the rules buys per-field errors: the backend's handler returns
 * only the first violation as a single string, which is fine for a banner but
 * cannot highlight three bad inputs at once. The server remains authoritative —
 * anything that slips past this still gets rejected there.
 */
const ProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, { error: "SKU is required." })
    .max(100, { error: "SKU must be 100 characters or fewer." })
    .regex(/^[A-Z0-9-]+$/, {
      error: "Use uppercase letters, digits, and dashes only.",
    }),
  title: z
    .string()
    .trim()
    .min(1, { error: "Title is required." })
    .max(255, { error: "Title must be 255 characters or fewer." }),
  category: z
    .string()
    .trim()
    .min(1, { error: "Category is required." })
    .max(100, { error: "Category must be 100 characters or fewer." }),
  tagline: z
    .string()
    .trim()
    .min(1, { error: "Tagline is required." })
    .max(255, { error: "Tagline must be 255 characters or fewer." }),
  description: z.string().trim().min(1, { error: "Description is required." }),
  emoji: z
    .string()
    .trim()
    .min(1, { error: "Pick an emoji — it stands in for the product image." })
    .max(16, { error: "That is too long to be a single emoji." }),
  basePrice: z.coerce
    .number({ error: "Base price must be a number." })
    .gt(0, { error: "Base price must be greater than zero." }),
  totalInventory: z.coerce
    .number({ error: "Inventory must be a number." })
    .int({ error: "Inventory must be a whole number." })
    .min(0, { error: "Inventory cannot be negative." }),
});

/** Mirrors `AdminDtos.FlashSaleRequest`, plus the window check. */
const FlashSaleSchema = z
  .object({
    productId: z.coerce
      .number({ error: "Choose a product." })
      .int()
      .positive({ error: "Choose a product." }),
    discountPrice: z.coerce
      .number({ error: "Sale price must be a number." })
      .gt(0, { error: "Sale price must be greater than zero." }),
    allocatedStock: z.coerce
      .number({ error: "Allocation must be a number." })
      .int({ error: "Allocation must be a whole number." })
      .min(1, { error: "Allocate at least one unit." }),
    startTime: z.string().min(1, { error: "Start time is required." }),
    endTime: z.string().min(1, { error: "End time is required." }),
  })
  .refine((data) => data.endTime > data.startTime, {
    // String comparison is sound here: both are `YYYY-MM-DDTHH:mm`, a format
    // whose lexical order matches its chronological order.
    error: "The sale must end after it starts.",
    path: ["endTime"],
  });

// --------------------------------------------------------------- products --

/**
 * Creates a product, or updates one when `id` is present.
 *
 * The two paths share a schema and differ only in verb and in what happens
 * afterwards: a new product sends you back to the list, while an edit stays put
 * so you can keep working on the same record.
 */
export async function saveProduct(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const id = formData.get("id")?.toString();

  const parsed = ProductSchema.safeParse({
    sku: formData.get("sku"),
    title: formData.get("title"),
    category: formData.get("category"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    emoji: formData.get("emoji"),
    basePrice: formData.get("basePrice"),
    totalInventory: formData.get("totalInventory"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const result = await adminFetch<AdminProduct>(
    id ? `/api/v1/admin/products/${id}` : "/api/v1/admin/products",
    {
      method: id ? "PUT" : "POST",
      body: {
        ...parsed.data,
        // One highlight per line in the textarea. Blank lines are dropped
        // rather than rejected — trailing newlines are how people type.
        highlights: (formData.get("highlights")?.toString() ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
    },
  );

  if (!result.ok) {
    // A duplicate SKU is a field problem, not a form problem. Anchoring it to
    // the input means the fix is visible where the typing happens.
    if (result.code === "SKU_TAKEN") {
      return { errors: { sku: [result.message] }, code: result.code };
    }
    return { message: result.message, code: result.code };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/sales");

  if (id) {
    return { success: "Saved." };
  }

  // Outside any try/catch: redirect() signals by throwing.
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  if (!id) return;

  const result = await adminFetch<null>(`/api/v1/admin/products/${id}`, {
    method: "DELETE",
  });

  revalidatePath("/admin/products");

  if (!result.ok) {
    // PRODUCT_IN_USE is the interesting one: the schema cascades, so deleting a
    // product with a live sale would take the sale and its Redis counter with
    // it while customers were mid-checkout. Surfaced in the URL because this
    // action is invoked from a plain form with no `useActionState` to hold it.
    redirect(`/admin/products?error=${encodeURIComponent(result.message)}`);
  }
}

// ------------------------------------------------------------ flash sales --

export async function saveFlashSale(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const id = formData.get("id")?.toString();

  const parsed = FlashSaleSchema.safeParse({
    productId: formData.get("productId"),
    discountPrice: formData.get("discountPrice"),
    allocatedStock: formData.get("allocatedStock"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const startTime = fromDateTimeLocalUtc(parsed.data.startTime);
  const endTime = fromDateTimeLocalUtc(parsed.data.endTime);

  if (!startTime || !endTime) {
    return { message: "Those dates could not be read. Please re-enter them." };
  }

  const result = await adminFetch<AdminFlashSale>(
    id ? `/api/v1/admin/flash-sales/${id}` : "/api/v1/admin/flash-sales",
    {
      method: id ? "PUT" : "POST",
      body: {
        productId: parsed.data.productId,
        discountPrice: parsed.data.discountPrice,
        allocatedStock: parsed.data.allocatedStock,
        startTime,
        endTime,
      },
    },
  );

  if (!result.ok) {
    return { message: result.message, code: result.code };
  }

  revalidatePath("/admin/sales");
  revalidatePath("/admin");

  if (id) {
    return { success: "Saved." };
  }

  redirect("/admin/sales");
}

/**
 * Moves a sale through its lifecycle.
 *
 * This is the highest-consequence button in the console. Activating pre-warms
 * the Redis counter and makes the sale purchasable; ending tears the counter
 * down and writes the final unsold figure back to Postgres. The service refuses
 * anything outside the legal transition table, so an out-of-date UI produces a
 * rejected request rather than a corrupted sale.
 */
export async function changeSaleStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  // Validated against the known set before it reaches the wire: this value
  // comes from a form field, and an unrecognised status would otherwise
  // produce a 400 that reads like a backend fault.
  if (!id || !SALE_STATUSES.includes(status as SaleStatus)) return;

  const result = await adminFetch<AdminFlashSale>(
    `/api/v1/admin/flash-sales/${id}/status`,
    { method: "PUT", body: { status } },
  );

  revalidatePath("/admin/sales");
  revalidatePath("/admin");

  if (!result.ok) {
    redirect(`/admin/sales?error=${encodeURIComponent(result.message)}`);
  }
}

/**
 * Republishes metadata for every ACTIVE sale.
 *
 * The repair tool for a flushed Redis or expired metadata under a running sale.
 * It cannot resurrect stock — the underlying write is a SETNX, which leaves an
 * existing counter alone — so it is safe to run mid-sale.
 */
export async function prewarmActiveSales(): Promise<void> {
  await requireAdmin();

  const result = await adminFetch<{ salesWarmed: number }>(
    "/api/v1/admin/flash-sales/prewarm",
    { method: "POST" },
  );

  revalidatePath("/admin/sales");

  redirect(
    result.ok
      ? `/admin/sales?warmed=${result.data.salesWarmed}`
      : `/admin/sales?error=${encodeURIComponent(result.message)}`,
  );
}

// ------------------------------------------------------------------ users --

export async function changeUserRole(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id")?.toString();
  const role = formData.get("role")?.toString();

  if (!id || (role !== "ADMIN" && role !== "CUSTOMER")) return;

  const result = await adminFetch<AdminUser>(
    `/api/v1/admin/users/${id}/role`,
    { method: "PUT", body: { role } },
  );

  revalidatePath("/admin/users");

  if (!result.ok) {
    // CANNOT_DEMOTE_SELF and LAST_ADMIN both land here. Both are guards against
    // locking every human out of the panel with no in-app way back.
    redirect(`/admin/users?error=${encodeURIComponent(result.message)}`);
    return;
  }

  // The role travels in the JWT rather than being read per request, so the
  // change only takes effect for the target user when their current token
  // expires. Saying so prevents "I demoted them and nothing happened".
  redirect(
    `/admin/users?notice=${encodeURIComponent(
      `${result.data.name} is now ${result.data.role}. Takes effect for them when their current session token expires.`,
    )}`,
  );
}
