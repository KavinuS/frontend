import { LiveDot } from "@/components/ui/Badge";
import { Container, SectionHeading } from "@/components/ui/Section";

/*
 * Placeholder data. Replace with a live poll of the backend health endpoint
 * once the flash-sale service exists — see docs/PROJECT-REPORT.md, Phase 1.
 */
const services = [
  {
    name: "Flash Sale API",
    state: "Active",
    detail: "Customers can currently place orders.",
    metric: "p95 12ms",
  },
  {
    name: "Redis Inventory",
    state: "Online",
    detail: "Atomic stock counters responding normally.",
    metric: "p95 <2ms",
  },
  {
    name: "Order Queue",
    state: "Operational",
    detail: "Persistence workers are draining the queue.",
    metric: "0 backlog",
  },
];

export default function SystemStatus() {
  return (
    <Container className="pb-24">
      <SectionHeading
        eyebrow="Live system"
        tone="brand"
        title="System status"
        description="The pieces that keep a sale honest under load."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-green-500">
                  <LiveDot />
                </span>
                <h3 className="font-bold text-slate-900">{service.name}</h3>
              </div>

              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                {service.metric}
              </span>
            </div>

            <p className="mt-4 font-semibold text-green-600">{service.state}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {service.detail}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
