import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import {
  Clock3,
  Eye,
  KeyRound,
  MonitorSmartphone,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { TableSkeleton } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PaginationBar } from "../components/PaginationBar";
import { CountryBadge } from "../components/CountryBadge";
import { DeviceIcon } from "../components/DeviceIcon";
import { UserCell } from "../components/UserCell";
import { DeleteDialog } from "../components/DeleteDialog";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useApi, useDebounced } from "../lib/useApi";
import { formatDateTime, formatNumber, timeAgo } from "../lib/format";

export function SessionsPage() {
  const navigate = useNavigate();
  const { config } = useAuth();
  const { push } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const q = useDebounced(search);

  const { data, loading, error, refresh } = useApi("/sessions", {
    params: { page, limit: 20, q, active },
  });

  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;

  const stats = data?.stats ?? { total: 0, active: 0, expired: 0, remembered: 0 };
  const items = data?.items ?? [];

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await api.del(`/sessions/${selected.id}`, { confirm: "DELETE" });
      push({
        type: "success",
        title: "Session revoked",
        description: "The refresh token was deleted. That device will need to sign in again.",
      });
      setSelected(null);
      refresh();
    } catch (err) {
      push({ type: "error", title: "Could not revoke session", description: err.message });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Auth state"
        title="Sessions"
        description="Every refresh session stored by zyrava-server, with its sign-in location, device and expiry."
        actions={
          <>
            <Chip size="sm" variant="flat" className="bg-default-100/10 text-default-400">
              {formatNumber(stats.total)} sessions
            </Chip>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-content2/80"
              onPress={refresh}
              isLoading={loading}
              aria-label="Refresh sessions"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sessions"
          value={stats.total}
          icon={<MonitorSmartphone className="h-5 w-5" />}
          tone="violet"
          hint="All refresh tokens ever issued"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="emerald"
          hint="Not yet expired"
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          icon={<Clock3 className="h-5 w-5" />}
          tone="amber"
          hint="Awaiting MongoDB TTL cleanup"
        />
        <StatCard
          label="Remembered"
          value={stats.remembered}
          icon={<KeyRound className="h-5 w-5" />}
          tone="cyan"
          hint="Issued with remember-me"
        />
      </div>

      <div className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center">
          <Input
            size="sm"
            placeholder="Search listener name, email or phone…"
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            startContent={<Search className="h-4 w-4 text-default-500" />}
            className="lg:max-w-sm"
            variant="bordered"
            classNames={{ inputWrapper: "border-white/10 bg-content2/40" }}
          />
          <Select
            size="sm"
            aria-label="Session state"
            selectedKeys={[active]}
            onSelectionChange={(keys) => {
              setActive(Array.from(keys)[0] ?? "all");
              setPage(1);
            }}
            disallowEmptySelection
            className="w-44"
            classNames={{ trigger: "border-white/10 bg-content2/40" }}
          >
            <SelectItem key="all">All sessions</SelectItem>
            <SelectItem key="active">Active only</SelectItem>
            <SelectItem key="expired">Expired only</SelectItem>
          </Select>
        </div>

        <Table
          aria-label="ZYRAVA sessions"
          removeWrapper
          isStriped
          classNames={{
            th: "bg-transparent text-[10px] uppercase tracking-[0.12em] text-default-500",
            td: "py-3",
            tr: "hover:bg-white/[0.02]",
          }}
        >
          <TableHeader>
            <TableColumn>LISTENER</TableColumn>
            <TableColumn className="hidden md:table-cell">LOCATION</TableColumn>
            <TableColumn className="hidden lg:table-cell">DEVICE</TableColumn>
            <TableColumn className="hidden xl:table-cell">CREATED</TableColumn>
            <TableColumn className="hidden lg:table-cell">EXPIRES</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn align="end">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            isLoading={loading}
            loadingContent={<TableSkeleton />}
            emptyContent={
              <EmptyState
                title={q ? "No sessions match that search" : "No sessions recorded"}
                description={
                  q
                    ? "Try a different listener name, email address or phone number."
                    : "Refresh sessions appear here when listeners sign in."
                }
                className="border-0 bg-transparent"
              />
            }
          >
            {(session) => (
              <TableRow key={session.id}>
                <TableCell>
                  {session.user ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/users/${session.user.id}`)}
                      className="text-left transition hover:opacity-80"
                    >
                      <UserCell user={session.user} />
                    </button>
                  ) : (
                    <span className="text-[11px] text-default-600">Account removed</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {session.country || session.city ? (
                    <div>
                      <CountryBadge
                        code={session.country}
                        name={session.city || session.countryName}
                      />
                      <p className="mt-0.5 font-mono text-[9px] text-default-600">
                        {session.ip || "No IP"}
                      </p>
                    </div>
                  ) : (
                    <span className="font-mono text-[10px] text-default-600">
                      {session.ip || "No IP"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1.5 text-[11px] text-default-400">
                    <DeviceIcon name={session.device} className="h-3.5 w-3.5 text-default-500" />
                    {session.device}
                  </div>
                  <p className="text-[9px] text-default-600">
                    {session.browser} · {session.os}
                  </p>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <p className="text-[11px] text-default-400">{formatDateTime(session.createdAt)}</p>
                  <p className="text-[9px] text-default-600">{timeAgo(session.createdAt)}</p>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <p className="text-[11px] text-default-400">{formatDateTime(session.expiresAt)}</p>
                  <p className="text-[9px] text-default-600">
                    {session.remember ? "Remember-me" : "Session only"}
                  </p>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={session.active ? "success" : "default"}
                    className="h-6 text-[10px]"
                  >
                    {session.active ? "Active" : "Expired"}
                  </Chip>
                </TableCell>
                <TableCell align="end">
                  <div className="flex items-center justify-end gap-1">
                    {session.user ? (
                      <Tooltip content="Open listener profile">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => navigate(`/users/${session.user.id}`)}
                          aria-label="Open listener profile"
                        >
                          <Eye className="h-4 w-4 text-default-400" />
                        </Button>
                      </Tooltip>
                    ) : null}
                    <Tooltip
                      content={
                        config.allowDelete
                          ? "Revoke this refresh session"
                          : "Delete actions are disabled by the administrator"
                      }
                    >
                      <span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          isDisabled={!config.allowDelete}
                          onPress={() => setSelected(session)}
                          aria-label="Revoke session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <PaginationBar
          page={data?.page ?? page}
          pages={data?.pages ?? 1}
          total={data?.total ?? 0}
          limit={data?.limit ?? 20}
          onChange={setPage}
        />
      </div>

      <DeleteDialog
        isOpen={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title="Revoke this session?"
        description={
          selected
            ? `The refresh token for ${
                selected.user?.email || selected.user?.phone || "this listener"
              } will be deleted. That device has to sign in again. This cannot be undone.`
            : ""
        }
        confirmWord="DELETE"
        actionLabel="Revoke session"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
