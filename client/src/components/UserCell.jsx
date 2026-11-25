import { Avatar } from "@heroui/react";
import { displayName, initials } from "../lib/format";

export function UserCell({ user, secondary, size = "sm" }) {
  const secondaryText =
    secondary ??
    user?.email ??
    user?.phone ??
    "No contact details";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        size={size}
        name={initials(user?.name, user?.email, user?.phone)}
        className="shrink-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-[11px] font-semibold text-white"
      />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-foreground">{displayName(user)}</p>
        <p className="truncate text-[11px] text-default-500">{secondaryText}</p>
      </div>
    </div>
  );
}
