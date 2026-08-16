/** Small shared pieces used by both the login and register forms. */

/**
 * Form-level failure (bad credentials, backend down). `role="alert"` so it is
 * announced when it appears after a submit.
 */
export function FormBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-slate-200" />
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
      className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
