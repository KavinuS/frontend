import Link from "next/link";

/**
 * Button styling lives in one place so a <button> and a <Link> that look
 * identical can't drift apart. Pick the element by meaning: `Button` for an
 * action, `ButtonLink` for navigation.
 *
 * The shape comes from the Modernist design system (`.fx-btn` in globals.css):
 * square, flat, Archivo 800, no shadow and no lift on hover. Only the fill
 * changes between variants, which is what lets a mixed row of actions still
 * read as one control strip.
 *
 * `primary` and `flash` are the same button. The system has a single accent, so
 * there is no second "urgent" colour to promote a flash-sale action with —
 * both names are kept because the call sites distinguish them semantically.
 */

export type ButtonVariant = "primary" | "flash" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "fx-btn-primary",
  flash: "fx-btn-primary",
  secondary: "fx-btn-secondary",
  ghost: "fx-btn-ghost",
  // Destructive actions are ghost-accent rather than a separate red: in a
  // system whose only accent already *is* red, a second one would be invisible.
  danger: "fx-btn-ghost",
};

/*
 * No `!important` needed: `.fx-btn` sits in Tailwind's `components` layer and
 * these are utilities, which the cascade places after it.
 */
const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px]",
  md: "",
  lg: "px-[22px] py-3.5 text-[15px]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return [
    "fx-btn",
    variants[variant],
    sizes[size],
    fullWidth ? "fx-btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      // Defaulted to "button": an unset type inside a <form> submits it, which
      // has bitten every quantity stepper ever written.
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
