import type { Reconciliation } from "@/app/lib/admin-types";
import { CheckIcon, WarningIcon } from "@/components/admin/icons";
import { Card } from "@/components/admin/ui";

/**
 * The zero-oversell proof for one sale, shown as arithmetic rather than a
 * verdict.
 *
 *     allocated = confirmed + live + in-flight
 *
 * A boolean "healthy" badge would be worth very little here: the whole claim of
 * this architecture is that the identity holds under concurrent load, so the
 * numbers themselves are the evidence. An operator can check the addition.
 *
 * Two failure modes are distinguished, because they mean opposite things:
 *
 *   oversold   — more units confirmed than ever existed. A correctness bug in
 *                the reservation path. The number is the damage.
 *   in-flight  — reserved in Redis, not yet written to Postgres. Entirely
 *                normal while the queue drains; a problem only if it never
 *                settles to zero.
 */
export function ReconciliationPanel({
  data,
  status,
}: {
  data: Reconciliation;
  status: string;
}) {
  const closed = data.liveStock === null;
  const inFlight = data.inFlightUnits ?? 0;

  const verdict = data.oversold
    ? {
        tone: "danger" as const,
        title: "Oversold",
        body: `${data.confirmedUnits - data.allocatedStock} more unit(s) were confirmed than this sale ever held. This is a correctness defect in the reservation path, not a reporting lag.`,
      }
    : closed
      ? {
          tone: "neutral" as const,
          title: "Not applicable",
          body: `This sale is ${status} and its Redis counter has been torn down, so there is nothing live to reconcile against. The confirmed total below is final.`,
        }
      : data.balanced
        ? {
            tone: "ok" as const,
            title: "Balanced",
            body: "Every allocated unit is accounted for: sold, or still on the shelf. Nothing was lost and nothing was invented.",
          }
        : {
            tone: "warn" as const,
            title: `${inFlight} unit(s) in flight`,
            body: "Reserved in Redis but not yet written to Postgres. This is the queue draining and should settle to zero within seconds. If it persists, check the dead-letter queue.",
          };

  const tones = {
    ok: "border-green-200 bg-green-50 text-green-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-900",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <Card
      title="Stock reconciliation"
      description="Allocated must equal confirmed plus what is still live. Any other result is a reportable defect."
    >
      <div className={`flex gap-3 rounded-xl border p-4 ${tones[verdict.tone]}`}>
        {verdict.tone === "ok" ? (
          <CheckIcon className="h-5 w-5 shrink-0 text-green-600" />
        ) : (
          <WarningIcon
            className={`h-5 w-5 shrink-0 ${
              verdict.tone === "danger"
                ? "text-red-500"
                : verdict.tone === "warn"
                  ? "text-amber-500"
                  : "text-slate-400"
            }`}
          />
        )}
        <div>
          <p className="text-sm font-bold">{verdict.title}</p>
          <p className="mt-0.5 text-sm">{verdict.body}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Figure
          label="Allocated"
          value={data.allocatedStock}
          hint="Set when scheduled"
        />
        <Figure
          label="Confirmed"
          value={data.confirmedUnits}
          hint={`${data.confirmedOrders} order(s) in Postgres`}
        />
        <Figure
          label="Live in Redis"
          value={data.liveStock}
          hint={closed ? "Counter torn down" : "What customers can still buy"}
        />
        <Figure
          label="In flight"
          value={data.inFlightUnits}
          hint="Reserved, awaiting write"
          tone={inFlight > 0 ? "warn" : "default"}
        />
      </div>

      {/* The identity spelled out, so the panel teaches what it is checking. */}
      <p className="mt-5 rounded-xl bg-slate-900 px-4 py-3 font-mono text-xs text-slate-300">
        {data.allocatedStock} allocated ={" "}
        <span className="text-white">{data.confirmedUnits}</span> confirmed +{" "}
        <span className="text-white">{data.liveStock ?? "—"}</span> live +{" "}
        <span className="text-white">{data.inFlightUnits ?? "—"}</span> in flight
      </p>
    </Card>
  );
}

function Figure({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  /** null renders as an em dash — "no counter" is not the same as zero. */
  value: number | null;
  hint: string;
  tone?: "default" | "warn";
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-xl font-bold tabular-nums ${
          value === null
            ? "text-slate-300"
            : tone === "warn"
              ? "text-amber-600"
              : "text-slate-900"
        }`}
      >
        {value ?? "—"}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
