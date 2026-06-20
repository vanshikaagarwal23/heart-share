import { ChevronLeft, ChevronRight } from "lucide-react";

// Small, reusable pager for any table/list — replaces the previous pattern
// of silently slicing arrays to a fixed length with no indication more
// data exists. Caller owns the page state; this component is purely
// presentational plus the two nav callbacks.
export default function Pagination({ page, pageCount, total, pageSize, onChange }) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  return (
    <div
      className="flex items-center justify-between gap-3 pt-3 mt-1 border-t flex-wrap"
      style={{ borderColor: "var(--color-border-soft)" }}
    >
      <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
        Showing <span style={{ color: "var(--color-text-secondary)" }}>{start}–{end}</span> of{" "}
        <span style={{ color: "var(--color-text-secondary)" }}>{total}</span>
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="w-7 h-7 rounded-md flex items-center justify-center border transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/[0.03]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft size={14} />
        </button>

        <span className="text-[11px] px-2 tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
          {page} / {pageCount}
        </span>

        <button
          onClick={() => onChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          aria-label="Next page"
          className="w-7 h-7 rounded-md flex items-center justify-center border transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/[0.03]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}