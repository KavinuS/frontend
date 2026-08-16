export type SaleStatus = "SCHEDULED" | "ACTIVE" | "ENDED" | "EXHAUSTED";

export type Product = {
  id: number;
  name: string;
  originalPrice: number;
  salePrice: number;
  remainingStock: number;
  totalStock: number;

  /* --- Added for the detail, cart, and checkout pages. --- */

  /** URL segment and cart key. Mirrors `products.sku` in the schema. */
  sku: string;
  category: string;
  /** One-line pitch used on cards. */
  tagline: string;
  description: string;
  /** Stand-in for product photography, which the seed data has none of. */
  emoji: string;
  highlights: string[];
  status: SaleStatus;
  /**
   * ISO timestamp the sale closes. Stored as a string rather than a Date so the
   * seed data serialises cleanly from a Server Component to the countdown,
   * which is a Client Component.
   */
  endsAt: string;
};
