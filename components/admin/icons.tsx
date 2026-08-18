/**
 * The console's icon set.
 *
 * Hand-rolled rather than pulled from a library: nine glyphs do not justify a
 * dependency, and inline SVG has no bundle cost beyond the markup itself. All
 * of them share a 24-box, 1.75 stroke, and `currentColor`, so they inherit
 * whatever text colour surrounds them.
 *
 * Every icon here is decorative — each one sits next to a text label — so they
 * are hidden from assistive technology rather than given a redundant name.
 */

type IconProps = { className?: string };

function Icon({ className = "h-5 w-5", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const DashboardIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Icon>
);

export const BoxIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21 8.4v7.2a2 2 0 0 1-1.06 1.77l-7 3.6a2 2 0 0 1-1.88 0l-7-3.6A2 2 0 0 1 3 15.6V8.4a2 2 0 0 1 1.06-1.77l7-3.6a2 2 0 0 1 1.88 0l7 3.6A2 2 0 0 1 21 8.4Z" />
    <path d="m3.3 7.5 8.7 4.5 8.7-4.5" />
    <path d="M12 21v-9" />
  </Icon>
);

export const BoltIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M13 2 4.5 13.2a.6.6 0 0 0 .48.96H11l-1 7.84 8.5-11.2a.6.6 0 0 0-.48-.96H12l1-7.84Z" />
  </Icon>
);

export const ReceiptIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-2.8-1.6L13.4 21l-2.8-1.6L7.8 21 5 19.4Z" />
    <path d="M9 8h6M9 12h6" />
  </Icon>
);

export const UsersIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.6 20a6.6 6.6 0 0 1 12.8 0" />
    <path d="M16.5 5.3a3.2 3.2 0 0 1 0 5.9M18 14.4a6.6 6.6 0 0 1 3.4 5.6" />
  </Icon>
);

export const StoreIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
    <path d="M3 6.5 4.6 3.6a1 1 0 0 1 .88-.6h13.04a1 1 0 0 1 .88.6L21 6.5a2.5 2.5 0 0 1-4.5 1.6 2.5 2.5 0 0 1-4.5 0 2.5 2.5 0 0 1-4.5 0A2.5 2.5 0 0 1 3 6.5Z" />
  </Icon>
);

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);

export const WarningIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10.3 3.9 2.5 17.4A1.9 1.9 0 0 0 4.15 20.3h15.7a1.9 1.9 0 0 0 1.65-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Icon>
);

export const RefreshIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
    <path d="M20.8 4v5h-5" />
  </Icon>
);
