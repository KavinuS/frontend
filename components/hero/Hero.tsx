import { LiveDot } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

/* Engineering targets from the proposal — see docs/PROJECT-REPORT.md. */
const stats = [
  { value: "5,000+", label: "Target RPS" },
  { value: "< 15ms", label: "Checkout latency" },
  { value: "100%", label: "Stock accuracy" },
  { value: "0", label: "Oversells" },
];

/**
 * The landing hero.
 *
 * Left-aligned and unornamented: the colour blooms, blur gradients and faint
 * grid that used to sit behind this are gone, along with the gradient-clipped
 * text. The design system's whole argument is that a 72px headline on an
 * off-white ground with one red mark next to it is louder than any of that, and
 * a hero that competes with the flash-sale table two screens down is the wrong
 * hero for this site.
 */
export default function Hero() {
  return (
    <section className="border-b-2 border-fx-divider">
      <Container className="pb-20 pt-24">
        <p className="fx-eyebrow flex items-center gap-2.5 tracking-[0.16em] text-fx-accent">
          <LiveDot size={9} />
          Flash sale is live
        </p>

        <h1 className="mt-5 max-w-[16ch] animate-fx-lift text-[clamp(44px,7vw,84px)] leading-[0.96] tracking-[-0.03em]">
          Limited stock.
          <br />
          Thousands of buyers.
        </h1>

        <p className="fx-muted mt-6 max-w-[52ch] text-lg">
          Grab the deal before the inventory disappears. Every reservation is
          atomic, so the counter you see is the counter that counts.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/sales" size="lg">
            Shop flash sales
          </ButtonLink>
          <ButtonLink href="#live-deals" variant="secondary" size="lg">
            See live deals
          </ButtonLink>
        </div>

        {/* The same ruled band the dashboard uses for its counters, so the
            marketing claims and the account's real figures are drawn with one
            device rather than two. */}
        <dl className="mt-20 grid grid-cols-2 border-y-2 border-fx-divider md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={[
                "border-fx-divider px-6 py-6 first:pl-0 last:pr-0",
                index % 2 === 1 ? "border-l" : index > 0 ? "md:border-l" : "",
                index < 2 ? "border-b md:border-b-0" : "",
              ].join(" ")}
            >
              <dt className="font-heading text-[32px] font-extrabold tracking-[-0.02em]">
                {stat.value}
              </dt>
              <dd className="fx-muted fx-eyebrow mt-1 tracking-[0.12em]">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
