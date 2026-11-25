import { VimithaThemeToggle } from "./VimithaThemeToggle";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import { LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { initials } from "../lib/format";

const TITLES = [
  { match: /^\/$/, label: "Overview" },
  { match: /^\/audience/, label: "Audience" },
  { match: /^\/visits/, label: "Visitor log" },
  { match: /^\/users\/.+/, label: "User profile" },
  { match: /^\/users/, label: "Users" },
  { match: /^\/content/, label: "Content" },
  { match: /^\/sessions/, label: "Sessions" },
  { match: /^\/payments/, label: "Payments" },
  { match: /^\/system/, label: "System health" },
];

export function Topbar({ onMenu }) {
  const { admin, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const title = TITLES.find((item) => item.match.test(location.pathname))?.label ?? "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/[0.06] bg-background/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="lg:hidden"
          onPress={onMenu}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-default-600 sm:block">
            ZYRAVA Admin
          </p>
          <p className="truncate font-display text-sm font-semibold text-foreground">{title}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <VimithaThemeToggle />
        <Chip
          size="sm"
          variant="flat"
          color="success"
          startContent={<span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          className="hidden bg-emerald-500/10 text-emerald-400 sm:flex"
        >
          Live · 5s
        </Chip>

        <Tooltip content={isDark ? "Light mode" : "Dark mode"}>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="bg-content2/80"
            onPress={toggle}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </Tooltip>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              size="sm"
              className="h-10 gap-2 px-1.5 sm:px-2"
              aria-label="Administrator menu"
            >
              <Avatar
                size="sm"
                name={initials("Administrator", admin?.email)}
                className="bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-[10px] font-semibold text-white"
              />
              <div className="hidden max-w-40 text-left md:block">
                <p className="truncate text-[11px] font-semibold text-default-200">Administrator</p>
                <p className="truncate text-[10px] text-default-500">{admin?.email}</p>
              </div>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Administrator menu"
            onAction={(key) => {
              if (key === "logout") {
                logout();
                navigate("/login", { replace: true });
              }
            }}
          >
            <DropdownItem key="profile" isReadOnly startContent={<UserRound className="h-4 w-4" />}>
              {admin?.email}
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              className="text-danger"
              startContent={<LogOut className="h-4 w-4" />}
            >
              Sign out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}
