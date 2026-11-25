import { NavLink } from "react-router-dom";
import {
  Activity,
  CreditCard,
  LayoutDashboard,
  LibraryBig,
  MapPinned,
  MonitorSmartphone,
  ScrollText,
  ServerCog,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import clsx from "clsx";
import { Brand } from "./Brand";
import { NAV_SECTIONS } from "../lib/constants";
import { useAuth } from "../context/AuthContext";

const ICONS = {
  dashboard: LayoutDashboard,
  audience: MapPinned,
  visits: ScrollText,
  users: UsersRound,
  content: LibraryBig,
  sessions: MonitorSmartphone,
  payments: CreditCard,
  system: ServerCog,
};

export function Sidebar({ isOpen, onClose }) {
  const { config } = useAuth();

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/[0.06] bg-content1/75 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-default-500 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-default-600">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = ICONS[item.icon] ?? Activity;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                          isActive
                            ? "bg-gradient-to-r from-violet-500/18 to-fuchsia-500/[0.06] text-white"
                            : "text-default-500 hover:bg-white/[0.04] hover:text-default-200"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive ? (
                            <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-cyan-300" />
                          ) : null}
                          <Icon
                            className={clsx(
                              "h-[17px] w-[17px] transition-colors",
                              isActive ? "text-violet-300" : "text-default-600 group-hover:text-default-400"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3">
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <p className="text-[11px] font-semibold text-default-200">
                {config.allowDelete ? "Admin access" : "Deletion disabled"}
              </p>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-default-500">
              {config.allowDelete
                ? "Destructive actions require typed confirmation."
                : "Delete actions are disabled by environment."}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[9px] uppercase tracking-[0.16em] text-default-600">
                zyrava-server linked
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
