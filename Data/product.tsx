import { Product } from "@/types/product";

/**
 * Seed catalogue — replaced by `GET /api/v1/flash-sales` in Phase 1.
 *
 * `endsAt` is relative to when this module is first evaluated, so the countdown
 * always has a future target instead of a date that quietly goes stale.
 *
 * Caveat: the sale pages are statically prerendered, so on a production build
 * that anchor is *build* time — leave a build running for long enough and the
 * live sales will count down to zero. Real `end_time` values arrive from the
 * `flash_sales` table in Phase 1, which makes this moot.
 */
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export const products: Product[] = [
  {
    id: 1,
    sku: "FX-AUDIO-001",
    name: "Wireless Headphones",
    category: "Audio",
    tagline: "Active noise cancelling, 40-hour battery.",
    description:
      "Over-ear wireless headphones with adaptive noise cancelling, multipoint pairing, and a 40-hour battery. Ships with a hard case and a USB-C cable.",
    emoji: "🎧",
    highlights: [
      "Adaptive active noise cancelling",
      "40-hour battery, 5-minute fast charge",
      "Multipoint pairing across two devices",
      "2-year warranty",
    ],
    originalPrice: 199,
    salePrice: 79,
    remainingStock: 128,
    totalStock: 500,
    status: "ACTIVE",
    endsAt: hoursFromNow(6),
  },

  {
    id: 2,
    sku: "FX-INPUT-002",
    name: "Gaming Keyboard",
    category: "Peripherals",
    tagline: "Hot-swappable switches, aluminium frame.",
    description:
      "A 75% mechanical keyboard with hot-swappable switches, per-key RGB, and a machined aluminium frame. Wired or 2.4GHz wireless.",
    emoji: "⌨️",
    highlights: [
      "Hot-swappable mechanical switches",
      "75% layout with rotary encoder",
      "2.4GHz wireless or USB-C wired",
      "Per-key RGB with onboard profiles",
    ],
    originalPrice: 120,
    salePrice: 59,
    remainingStock: 44,
    totalStock: 200,
    status: "ACTIVE",
    endsAt: hoursFromNow(3),
  },

  {
    id: 3,
    sku: "FX-DISPLAY-003",
    name: "4K Monitor",
    category: "Displays",
    tagline: "27-inch, 144Hz, factory calibrated.",
    description:
      "A 27-inch 4K IPS panel running at 144Hz with 95% DCI-P3 coverage, factory calibrated, and a single-cable USB-C dock with 90W passthrough.",
    emoji: "🖥️",
    highlights: [
      "27-inch 4K IPS at 144Hz",
      "95% DCI-P3, factory calibrated",
      "USB-C dock with 90W power delivery",
      "Height, tilt, and pivot adjustable",
    ],
    originalPrice: 649,
    salePrice: 399,
    remainingStock: 0,
    totalStock: 150,
    status: "EXHAUSTED",
    endsAt: hoursFromNow(9),
  },

  {
    id: 4,
    sku: "FX-AUDIO-004",
    name: "Studio Microphone",
    category: "Audio",
    tagline: "Cardioid condenser with USB-C and XLR.",
    description:
      "A large-diaphragm cardioid condenser that runs over USB-C for streaming or XLR into an interface. Includes a shock mount and pop filter.",
    emoji: "🎙️",
    highlights: [
      "Large-diaphragm cardioid condenser",
      "USB-C and XLR outputs",
      "Zero-latency headphone monitoring",
      "Shock mount and pop filter included",
    ],
    originalPrice: 180,
    salePrice: 99,
    // Deliberately below MAX_PER_ITEM so the stock-limited path is reachable in
    // the demo: without one of these, the per-customer cap always bites first
    // and "only N left" copy never renders.
    remainingStock: 3,
    totalStock: 120,
    status: "ACTIVE",
    endsAt: hoursFromNow(2),
  },

  {
    id: 5,
    sku: "FX-MOBILE-005",
    name: "Smart Watch",
    category: "Wearables",
    tagline: "AMOLED, 7-day battery, dual-band GPS.",
    description:
      "A 1.4-inch AMOLED smartwatch with dual-band GPS, blood-oxygen and heart-rate tracking, and a week of battery under normal use. 5ATM water resistant.",
    emoji: "⌚",
    highlights: [
      "1.4-inch AMOLED, always-on",
      "Dual-band GPS",
      "7-day typical battery",
      "5ATM water resistance",
    ],
    originalPrice: 299,
    salePrice: 169,
    remainingStock: 300,
    totalStock: 300,
    status: "SCHEDULED",
    endsAt: hoursFromNow(30),
  },

  {
    id: 6,
    sku: "FX-COMPUTE-006",
    name: "Gaming Laptop",
    category: "Computers",
    tagline: "16-inch, RTX graphics, 240Hz panel.",
    description:
      "A 16-inch gaming laptop with a 240Hz QHD+ display, RTX graphics, 32GB of RAM, and a 1TB NVMe drive. Vapour chamber cooling with a dedicated performance mode.",
    emoji: "💻",
    highlights: [
      "16-inch QHD+ at 240Hz",
      "32GB RAM, 1TB NVMe",
      "Vapour chamber cooling",
      "Per-key RGB keyboard",
    ],
    originalPrice: 1899,
    salePrice: 1299,
    remainingStock: 60,
    totalStock: 60,
    status: "SCHEDULED",
    endsAt: hoursFromNow(54),
  },
];

export const findProductBySku = (sku: string) =>
  products.find((product) => product.sku === sku);

export const liveProducts = () =>
  products.filter((product) => product.status === "ACTIVE" || product.status === "EXHAUSTED");

export const upcomingProducts = () =>
  products.filter((product) => product.status === "SCHEDULED");
