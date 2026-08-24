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
        title="System status"
        description="The pieces that keep a sale honest under load."
      />

      <div className="grid border-t-2 border-fx-divider md:grid-cols-3">
        {services.map((service, index) => (
          <div
            key={service.name}
            className={[
              "border-fx-divider py-6",
              index > 0 ? "border-t md:border-l md:border-t-0 md:pl-6" : "",
              index < services.length - 1 ? "md:pr-6" : "",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="flex items-center gap-2.5 text-base">
                <LiveDot />
                {service.name}
              </h3>

              <span className="fx-mono fx-muted text-xs">{service.metric}</span>
            </div>

            <p className="mt-3.5 font-heading text-sm font-extrabold text-fx-accent">
              {service.state}
            </p>
            <p className="fx-muted mt-1.5 text-sm">{service.detail}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
