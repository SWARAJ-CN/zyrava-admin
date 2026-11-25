import { countryFlag } from "../lib/format";

export function CountryBadge({ code, name, size = "sm" }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className={size === "lg" ? "text-xl leading-none" : "text-sm leading-none"}>
        {countryFlag(code)}
      </span>
      <span className="truncate">{name || code || "Unknown"}</span>
    </span>
  );
}
