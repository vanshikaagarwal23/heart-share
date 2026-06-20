export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-1">
      <div>
        <h1
          className="font-['DM_Serif_Display'] text-[22px] md:text-[24px] leading-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] md:text-[13px] mt-[2px]" style={{ color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex gap-2 flex-wrap items-center">{actions}</div>
      )}
    </div>
  );
}