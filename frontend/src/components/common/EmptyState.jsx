import { Inbox } from "lucide-react";

export default function EmptyState({ icon, title, subtitle, action }) {
  // Accept either a custom Lucide icon element or fall back to a neutral
  // default — never an emoji string, so every empty state across the app
  // (no donations, no campaigns, no volunteers...) reads the same way.
  const Icon = icon || <Inbox size={28} strokeWidth={1.5} />;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-rise-in">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: "var(--color-bg-sidebar-tile)", color: "var(--color-text-muted)" }}
      >
        {Icon}
      </div>
      {title && <div className="text-[13px] font-medium" style={{ color: "var(--color-text-secondary)" }}>{title}</div>}
      {subtitle && (
        <div className="text-xs mt-1 max-w-xs" style={{ color: "var(--color-text-muted)" }}>{subtitle}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}