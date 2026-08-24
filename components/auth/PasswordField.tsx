"use client";

import { useState } from "react";

import { FieldErrors } from "./TextField";

type PasswordFieldProps = {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  errors?: string[];
  /** Rendered to the right of the label — used for "Forgot password?". */
  labelAction?: React.ReactNode;
};

/**
 * Password input with a show/hide toggle.
 *
 * Client component purely for the toggle. The value is never lifted into React
 * state — the form posts it straight to the Server Action, so the plaintext
 * password never lives in a re-rendered client tree.
 */
export default function PasswordField({
  id,
  label,
  autoComplete,
  placeholder,
  errors,
  labelAction,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const invalid = Boolean(errors?.length);
  const errorId = `${id}-error`;

  return (
    <div className="fx-field">
      <label htmlFor={id} className="flex items-baseline justify-between gap-4">
        {label}
        {labelAction}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className="fx-input pr-16"
        />

        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          // tabIndex -1 keeps Tab going straight from the field to the submit
          // button; the toggle stays reachable by click and by shift-tab.
          tabIndex={-1}
          aria-controls={id}
          className="fx-muted absolute inset-y-0 right-0 px-3 text-xs uppercase tracking-[0.08em] hover:text-fx-ink"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <FieldErrors id={errorId} errors={errors} />
    </div>
  );
}
