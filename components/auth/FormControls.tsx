/** Small shared pieces used by both the login and register forms. */

/**
 * Form-level failure (bad credentials, backend down). `role="alert"` so it is
 * announced when it appears after a submit.
 *
 * A flat accent wash, no icon and no border: it is the same block the checkout
 * and order pages use to report a rejection, so a customer meets one error
 * shape across the whole storefront.
 */
export function FormBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="bg-fx-accent-100 px-4 py-3 text-[13px] text-fx-accent-800"
    >
      {message}
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <span aria-hidden="true" className="h-px flex-1 bg-fx-divider" />
      <span className="fx-muted fx-eyebrow tracking-[0.12em]">{label}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-fx-divider" />
    </div>
  );
}

export function SubmitButton({
  pending,
  idleLabel,
  pendingLabel,
}: {
  pending: boolean;
  idleLabel: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      // aria-busy tells assistive tech the control is working rather than broken.
      aria-busy={pending}
      className="fx-btn fx-btn-primary fx-btn-block px-4.5 py-3.5"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
