"use client";

import { useFormStatus } from "react-dom";

import { CheckIcon, WarningIcon } from "@/components/admin/icons";

/**
 * Form primitives for the admin console.
 *
 * Every field wires `aria-invalid` and `aria-describedby` to its error message.
 * Colouring a border red is invisible to a screen reader and to roughly one man
 * in twelve, so the association is what actually carries the failure.
 */

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500";

const inputTone = (invalid: boolean) =>
  invalid
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200";

function Wrapper({
  name,
  label,
  hint,
  errors,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>
      {children}
      {hint && !errors?.length && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
      {errors?.length ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  errors?: string[];
};

export function TextField({
  name,
  label,
  hint,
  errors,
  ...props
}: FieldProps & React.ComponentProps<"input">) {
  const invalid = Boolean(errors?.length);

  return (
    <Wrapper name={name} label={label} hint={hint} errors={errors}>
      <input
        id={name}
        name={name}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className={`${inputBase} ${inputTone(invalid)}`}
        {...props}
      />
    </Wrapper>
  );
}

export function TextArea({
  name,
  label,
  hint,
  errors,
  rows = 4,
  ...props
}: FieldProps & React.ComponentProps<"textarea">) {
  const invalid = Boolean(errors?.length);

  return (
    <Wrapper name={name} label={label} hint={hint} errors={errors}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className={`${inputBase} ${inputTone(invalid)} resize-y`}
        {...props}
      />
    </Wrapper>
  );
}

export function SelectField({
  name,
  label,
  hint,
  errors,
  children,
  ...props
}: FieldProps & React.ComponentProps<"select">) {
  const invalid = Boolean(errors?.length);

  return (
    <Wrapper name={name} label={label} hint={hint} errors={errors}>
      <select
        id={name}
        name={name}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className={`${inputBase} ${inputTone(invalid)}`}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
}

/**
 * Submit button that disables itself while the enclosing form is in flight.
 *
 * `useFormStatus` reads the status of the nearest parent form, which is why
 * this has to be its own component rather than a branch inside the form — the
 * hook returns null for the component that renders the `<form>` itself.
 *
 * Guarding against the double-submit matters here: two POSTs to
 * `/api/v1/admin/flash-sales` create two sales, each with its own stock
 * allocation against the same inventory.
 */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "flash" | "danger";
}) {
  const { pending } = useFormStatus();

  const tones = {
    primary: "bg-slate-900 hover:bg-slate-800 focus-visible:ring-slate-500",
    flash: "bg-orange-500 hover:bg-orange-600 focus-visible:ring-orange-400",
    danger: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-400",
  } as const;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 ${tones[variant]} ${className}`}
    >
      {pending && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Form-level banner for a failure the backend reported. */
export function FormError({ message }: { message: string }) {
  return (
    <div
      // Announced when it appears — a validation message that only exists
      // visually is missed by anyone not looking at that part of the page.
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
    >
      <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <p className="text-sm font-medium text-red-800">{message}</p>
    </div>
  );
}

export function FormSuccess({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
    >
      <CheckIcon className="h-4 w-4 shrink-0 text-green-600" />
      <p className="text-sm font-medium text-green-800">{message}</p>
    </div>
  );
}
