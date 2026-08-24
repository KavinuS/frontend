import type { Metadata } from "next";

import { listFlashSales } from "@/app/lib/catalog";
import SalesTable from "@/components/sales/SalesTable";
import { Container, EmptyState } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Flash Sales — FlashX",
  description:
    "Every live and scheduled FlashX drop. Limited stock, atomic reservations.",
};

/**
 * The catalogue board.
 *
 * The live/upcoming split this page used to have is gone: everything is one
 * table now, filtered client-side. See `SalesTable` for why.
 */
export default async function SalesPage() {
  const catalogue = await listFlashSales();

  return (
    <Container className="pb-22 pt-16">
      <p className="fx-eyebrow tracking-[0.16em] text-fx-accent">Catalogue</p>

      <h1 className="mt-3.5 animate-fx-lift text-[clamp(44px,6vw,72px)] tracking-[-0.03em]">
        Flash sales
      </h1>

      <p className="fx-muted mt-3 max-w-[58ch]">
        Every sale in the board — live, scheduled and closed. Stock counters are
        claimed atomically at checkout, so the number beside a bar is the number
        that counts.
      </p>

      {!catalogue.ok ? (
        // Says what actually failed instead of rendering an empty table, which
        // would read as "no sales" and is a different problem.
        <div className="mt-10">
          <EmptyState
            icon="🔌"
            title="Can't reach the catalogue"
            description={catalogue.message}
          />
        </div>
      ) : catalogue.data.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon="😴"
            title="No sales on the board"
            description="Nothing is running or scheduled at the moment. Check back before the next drop."
          />
        </div>
      ) : (
        <SalesTable products={catalogue.data} />
      )}
    </Container>
  );
}
