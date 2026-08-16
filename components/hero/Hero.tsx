import { Badge, LiveDot } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

/* Engineering targets from the proposal — see docs/PROJECT-REPORT.md. */
const stats = [
  { value: "5,000+", label: "Target RPS" },
  { value: "< 15ms", label: "Checkout latency" },
  { value: "100%", label: "Stock accuracy" },
  { value: "0", label: "Oversells" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">

      {/*
        Decorative background: two soft colour blooms plus a faint grid.
        Pointer-events-none and aria-hidden so none of it intercepts clicks or
        reaches the accessibility tree.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -right-32 top-16 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <Container className="relative py-24 text-center lg:py-32">

        <div className="mb-6 flex justify-center">
          <Badge tone="flash" className="px-4 py-1.5 text-sm">
            <LiveDot />
            Flash sale is live
          </Badge>
        </div>

        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
          Limited stock.
          <br />
          <span className="bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Thousands of buyers.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          Grab the deal before the inventory disappears. Every reservation is
          atomic, so the counter you see is the counter that counts.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/sales" variant="flash" size="lg">
            Shop flash sales
          </ButtonLink>
          <ButtonLink href="#live-deals" variant="secondary" size="lg">
            See live deals
          </ButtonLink>
        </div>

        <dl className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-6 backdrop-blur-sm transition-colors hover:border-slate-300"
            >
              <dt className="text-2xl font-bold text-blue-600 lg:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>

      </Container>
    </section>
  );
}
