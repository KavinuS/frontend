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
    <div className="fx-field">
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        // `.fx-input[aria-invalid="true"]` carries the accent border, so the
        // invalid state is expressed once, in CSS, rather than in every field.
        aria-invalid={invalid}
        // Points screen readers at the message below, but only when there is one.
        aria-describedby={invalid ? errorId : undefined}
        className="fx-input"
      />

      <FieldErrors id={errorId} errors={errors} />
    </div>
  );
}

export function FieldErrors({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;

  // Single message reads as a sentence; multiple (the password rules) read as a list.
  return (
    <div id={id} className="mt-1.5 text-xs text-fx-accent-700">
      {errors.length === 1 ? (
        <p>{errors[0]}</p>
      ) : (
        <ul className="grid gap-0.5">
          {errors.map((error) => (
            <li key={error} className="flex gap-2">
              <span aria-hidden="true">·</span>
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
