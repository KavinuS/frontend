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
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-slate-900">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-20 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            invalid
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
          }`}
        />

        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          // tabIndex -1 keeps Tab going straight from the field to the submit
          // button; the toggle stays reachable by click and by shift-tab.
          tabIndex={-1}
          aria-controls={id}
          className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <FieldErrors id={errorId} errors={errors} />
    </div>
  );
}
