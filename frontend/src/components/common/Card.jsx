export default function Card({
  children,
  className = "",
  style,
  onClick,
  variant = "default",
  padding = "p-4",
  as: Tag = "div",
}) {
  const base = "bg-white rounded-xl transition-all";

  const variants = {
    // Static container — most cards on the platform.
    default: "shadow-[var(--shadow-sm)] border border-black/[0.03]",
    // Used for forms and standalone panels that need a firmer edge.
    bordered: "border border-black/10",
    // Reserved for genuinely clickable surfaces (table rows opening a
    // detail view, selectable options) — lifts on hover, not decorative.
    interactive:
      "shadow-[var(--shadow-sm)] border border-black/[0.03] hover:shadow-[var(--shadow-md)] hover:-translate-y-[1px] cursor-pointer",
    // Subtle tinted panel for inline notices (verification banners etc.)
    sunken: "bg-[var(--color-surface-sunken)] border border-black/[0.04]",
  };

  const interactionProps = onClick
    ? {
        onClick,
        role: "button",
        tabIndex: 0,
        onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } },
      }
    : {};

  return (
    <Tag
      className={`${base} ${variants[variant] || variants.default} ${padding} ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ transitionDuration: "var(--duration-base)", transitionTimingFunction: "var(--ease-standard)", ...style }}
      {...interactionProps}
    >
      {children}
    </Tag>
  );
}