type TextFieldProps = {
  id: string;
  label: string;
  type?: "text" | "email";
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  errors?: string[];
};

export default function TextField({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  defaultValue,
  errors,
}: TextFieldProps) {
  const invalid = Boolean(errors?.length);
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-900"
      >
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={invalid}
        // Points screen readers at the message below, but only when there is one.
        aria-describedby={invalid ? errorId : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          invalid
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
        }`}
      />

      <FieldErrors id={errorId} errors={errors} />
    </div>
  );
}

export function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;

  // Single message reads as a sentence; multiple (the password rules) read as a list.
  return (
    <div id={id} className="mt-1.5 text-sm text-red-600">
      {errors.length === 1 ? (
        <p>{errors[0]}</p>
      ) : (
        <ul className="list-inside list-disc space-y-0.5">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
