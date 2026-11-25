export function InfoRow({ label, value, mono = false, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2.5 ${className}`}>
      <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-default-500">{label}</span>
      <span
        className={`min-w-0 text-right text-[12px] text-default-300 ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
