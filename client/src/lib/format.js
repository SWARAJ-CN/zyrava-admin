import {
  format,
  formatDistanceToNowStrict,
  isThisYear,
  isValid,
} from "date-fns";

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
}

export function formatNumber(value) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    notation: Math.abs(number) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(number);
}

export function formatFullNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

export function formatDate(value, pattern = "dd MMM yyyy") {
  const date = toDate(value);
  return date ? format(date, pattern) : "—";
}

export function formatDateTime(value) {
  return formatDate(value, "dd MMM yyyy, HH:mm");
}

export function formatDayShort(value) {
  const date = toDate(value);
  return date ? format(date, isThisYear(date) ? "d MMM" : "d MMM yy") : "";
}

export function timeAgo(value) {
  const date = toDate(value);
  if (!date) return "—";
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds ?? 0)));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function initials(name, email = "", phone = "") {
  const source = (name || email || phone || "?").trim();
  const parts = source.replace(/[@._-]/g, " ").split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "?"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function displayName(user) {
  return user?.name || user?.email || user?.phone || "Unnamed listener";
}

export function countryFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((character) => 127397 + character.charCodeAt(0))
  );
}

export function shortId(value, length = 8) {
  const text = String(value ?? "");
  if (!text) return "—";
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function percent(value) {
  return `${Math.round(Number(value ?? 0))}%`;
}

export function urlHost(value) {
  if (!value) return "Direct / none";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
