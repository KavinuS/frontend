import Link from "next/link";

/**
 * Button styling lives in one place so a <button> and a <Link> that look
 * identical can't drift apart. Pick the element by meaning: `Button` for an
 * action, `ButtonLink` for navigation.
 */

export type ButtonVariant = "primary" | "flash" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:shadow-none";

const variants: Record<ButtonVariant, string> = {
  // Lift + deepening shadow on hover is the one motion cue shared by every
  // primary action, so a click target feels the same everywhere.
  primary:
    "bg-blue-600 text-white shadow-sm shadow-blue-600/25 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus-visible:ring-blue-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:translate-y-0",
  flash:
    "bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 focus-visible:ring-orange-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:translate-y-0",
  secondary:
    "border border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:translate-y-0",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 disabled:text-slate-300",
  danger:
    "text-red-600 hover:bg-red-50 focus-visible:ring-red-400 disabled:text-slate-300",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
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
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
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
