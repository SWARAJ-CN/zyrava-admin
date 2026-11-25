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
  Activity,
  Eye,
  Heart,
  ListMusic,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { TableSkeleton } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PaginationBar } from "../components/PaginationBar";
import { CountryBadge } from "../components/CountryBadge";
import { UserCell } from "../components/UserCell";
import { DeleteDialog } from "../components/DeleteDialog";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useApi, useDebounced } from "../lib/useApi";
import { formatDate, formatNumber, timeAgo } from "../lib/format";

export function UsersPage() {
  const navigate = useNavigate();
  const { config } = useAuth();
  const { push } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const q = useDebounced(search);

  const { data, loading, error, refresh } = useApi("/users", {
    params: { page, limit: 20, q, sort, type },
  });

  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      const result = await api.del(`/users/${selected.id}`, { confirm: "DELETE" });
      push({
        type: "success",
        title: "Account deleted",
        description: `Removed ${formatNumber(result.removed.likedSongs)} likes, ${formatNumber(
          result.removed.playlists
        )} playlists and ${formatNumber(result.removed.historyEvents)} history rows.`,
      });
      setSelected(null);
      refresh();
    } catch (err) {
      push({ type: "error", title: "Delete failed", description: err.message });
    } finally {
      setDeleting(false);
    }
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Accounts"
        title="Users"
        description="Every ZYRAVA account, where their latest session resolved from, and what their library holds."
        actions={
          <>
            <Chip size="sm" variant="flat" className="bg-default-100/10 text-default-400">
              {formatNumber(data?.total ?? 0)} accounts
            </Chip>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-content2/80"
              onPress={refresh}
              isLoading={loading}
              aria-label="Refresh users"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 lg:flex-row lg:items-center">
          <Input
            size="sm"
            placeholder="Search name, email or phone…"
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
          <div className="flex flex-wrap items-center gap-2">
            <Select
              size="sm"
              aria-label="Account type"
              selectedKeys={[type]}
              onSelectionChange={(keys) => {
                setType(Array.from(keys)[0] ?? "all");
                setPage(1);
              }}
              disallowEmptySelection
              className="w-40"
              classNames={{ trigger: "border-white/10 bg-content2/40" }}
            >
              <SelectItem key="all">All accounts</SelectItem>
              <SelectItem key="email">Email accounts</SelectItem>
              <SelectItem key="phone">Phone accounts</SelectItem>
            </Select>
            <Select
              size="sm"
              aria-label="Sort users"
              selectedKeys={[sort]}
              onSelectionChange={(keys) => {
                setSort(Array.from(keys)[0] ?? "newest");
                setPage(1);
              }}
              disallowEmptySelection
              className="w-44"
              classNames={{ trigger: "border-white/10 bg-content2/40" }}
            >
              <SelectItem key="newest">Newest first</SelectItem>
              <SelectItem key="oldest">Oldest first</SelectItem>
              <SelectItem key="active">Recently active</SelectItem>
            </Select>
          </div>
        </div>

        <Table
          aria-label="ZYRAVA users"
          removeWrapper
          isStriped
          classNames={{
            th: "bg-transparent text-[10px] uppercase tracking-[0.12em] text-default-500",
            td: "py-3",
            tr: "hover:bg-white/[0.02]",
          }}
        >
          <TableHeader>
            <TableColumn>USER</TableColumn>
            <TableColumn className="hidden md:table-cell">LOCATION</TableColumn>
            <TableColumn className="hidden lg:table-cell">JOINED</TableColumn>
            <TableColumn className="hidden xl:table-cell">LAST ACTIVE</TableColumn>
            <TableColumn className="hidden lg:table-cell">LIBRARY</TableColumn>
            <TableColumn>SESSIONS</TableColumn>
            <TableColumn align="end">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            isLoading={loading}
            loadingContent={<TableSkeleton />}
            emptyContent={
              <EmptyState
                title={q ? "No accounts match that search" : "No accounts yet"}
                description={
                  q
                    ? "Try a different name, email address or phone number."
                    : "Accounts will appear here as listeners register on zyrava-server."
                }
                className="border-0 bg-transparent"
              />
            }
          >
            {(user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                <TableCell>
                  <UserCell
                    user={user}
                    secondary={
                      [user.email, user.phone].filter(Boolean).join(" · ") || "No contact details"
                    }
                  />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.location?.country || user.location?.city ? (
                    <div>
                      <CountryBadge
                        code={user.location.country}
                        name={user.location.city || user.location.countryName}
                      />
                      <p className="mt-0.5 text-[10px] text-default-600">
                        {[user.location.region, user.location.countryName].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-default-600">No sign-in IP</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <p className="text-[12px] text-default-300">{formatDate(user.createdAt)}</p>
                  <p className="text-[10px] text-default-600">{timeAgo(user.createdAt)}</p>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <p className="text-[12px] text-default-300">
                    {user.lastSeenAt || user.lastLoginAt ? timeAgo(user.lastSeenAt || user.lastLoginAt) : "—"}
                  </p>
                  <p className="text-[10px] text-default-600">
                    {user.browser} · {user.os}
                  </p>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2.5 text-[11px] text-default-500">
                    <span className="inline-flex items-center gap-1" title="Liked songs">
                      <Heart className="h-3 w-3 text-rose-400" /> {formatNumber(user.likedCount)}
                    </span>
                    <span className="inline-flex items-center gap-1" title="Playlists">
                      <ListMusic className="h-3 w-3 text-violet-300" /> {formatNumber(user.playlistCount)}
                    </span>
                    <span className="inline-flex items-center gap-1" title="History events">
                      <Activity className="h-3 w-3 text-cyan-300" /> {formatNumber(user.eventCount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={user.activeSessions ? "success" : "default"}
                    className="h-6 text-[10px]"
                  >
                    {user.activeSessions}/{user.sessionCount}
                  </Chip>
                </TableCell>
                <TableCell align="end">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Tooltip content="Open profile">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => navigate(`/users/${user.id}`)}
                        aria-label="Open user profile"
                      >
                        <Eye className="h-4 w-4 text-default-400" />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      content={
                        config.allowDelete
                          ? "Delete account and related data"
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
                          onPress={() => setSelected(user)}
                          aria-label="Delete user"
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
        title="Delete this account?"
        description={
          selected
            ? `This permanently removes ${selected.email || selected.phone || "the account"} plus its sessions, liked songs, playlists, listening history and cached songs. This cannot be undone.`
            : ""
        }
        confirmWord="DELETE"
        actionLabel="Delete account"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
