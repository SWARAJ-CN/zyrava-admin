import { useState } from "react";
import { UserPaymentsTab } from "../components/UserPaymentsTab";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Tab,
  Tabs,
  Tooltip,
} from "@heroui/react";
import {
  Activity,
  ChevronLeft,
  CirclePlay,
  Clock3,
  Database,
  Globe2,
  Heart,
  KeyRound,
  ListMusic,
  MonitorSmartphone,
  Music2,
  Search,
  Trash2,
} from "lucide-react";
import { PageSkeleton } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { ProgressCard } from "../components/ProgressCard";
import { InfoRow } from "../components/InfoRow";
import { CountryBadge } from "../components/CountryBadge";
import { SongMedia } from "../components/SongMedia";
import { BarList } from "../components/BarList";
import { DeleteDialog } from "../components/DeleteDialog";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import {
  displayName,
  formatDate,
  formatDateTime,
  formatNumber,
  initials,
  timeAgo,
} from "../lib/format";
import { EVENT_KIND_META } from "../lib/constants";

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config } = useAuth();
  const { push } = useToast();
  const { data, loading, error, refresh } = useApi(`/users/${id}`);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <PageSkeleton cards={6} rows={2} />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const { user, stats, location, device, sessions, liked, playlists, topSongs, topArtists } = data;

  async function deleteAccount() {
    setBusy(true);
    try {
      const result = await api.del(`/users/${id}`, { confirm: "DELETE" });
      push({
        type: "success",
        title: "Account deleted",
        description: `${formatNumber(result.removed.sessions)} sessions, ${formatNumber(
          result.removed.likedSongs
        )} likes and ${formatNumber(result.removed.historyEvents)} history rows removed.`,
      });
      navigate("/users", { replace: true });
    } catch (err) {
      push({ type: "error", title: "Delete failed", description: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function revokeSessions() {
    setBusy(true);
    try {
      const result = await api.del(`/users/${id}/sessions`, { confirm: "REVOKE" });
      push({
        type: "success",
        title: "Sessions revoked",
        description: `${formatNumber(result.revoked)} refresh session(s) deleted.`,
      });
      setRevokeOpen(false);
      refresh();
    } catch (err) {
      push({ type: "error", title: "Could not revoke sessions", description: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <Button
        size="sm"
        variant="light"
        className="-ml-2 w-fit text-default-500"
        startContent={<ChevronLeft className="h-4 w-4" />}
        onPress={() => navigate("/users")}
      >
        Back to users
      </Button>

      <div className="surface p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar
              size="lg"
              name={initials(user.name, user.email, user.phone)}
              className="h-14 w-14 shrink-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 text-base font-semibold text-white"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  {displayName(user)}
                </h1>
                <Chip
                  size="sm"
                  variant="flat"
                  color={stats.activeSessions ? "success" : "default"}
                  className="h-6 text-[10px]"
                >
                  {stats.activeSessions ? "Active session" : "No active session"}
                </Chip>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-default-500">
                {user.email ? <span>{user.email}</span> : null}
                {user.phone ? <span>{user.phone}</span> : null}
                <span>Joined {formatDate(user.createdAt)}</span>
                <span className="font-mono text-[10px] text-default-600">ID {user.id}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip content={stats.sessions ? "Delete all refresh sessions" : "No sessions to revoke"}>
              <span>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<KeyRound className="h-4 w-4" />}
                  isDisabled={!config.allowDelete || !stats.sessions}
                  onPress={() => setRevokeOpen(true)}
                >
                  Revoke sessions
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              content={
                config.allowDelete
                  ? "Delete account and all related data"
                  : "Delete actions are disabled by the administrator"
              }
            >
              <span>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<Trash2 className="h-4 w-4" />}
                  isDisabled={!config.allowDelete}
                  onPress={() => setDeleteOpen(true)}
                >
                  Delete user
                </Button>
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Sessions"
          value={stats.sessions}
          icon={<MonitorSmartphone className="h-5 w-5" />}
          tone="emerald"
          hint={`${formatNumber(stats.activeSessions)} active`}
        />
        <StatCard
          label="Liked songs"
          value={stats.likes}
          icon={<Heart className="h-5 w-5" />}
          tone="pink"
          hint={timeAgo(stats.firstLikeAt) === "—" ? "No saves yet" : `First ${timeAgo(stats.firstLikeAt)}`}
        />
        <StatCard
          label="Playlists"
          value={stats.playlists}
          icon={<ListMusic className="h-5 w-5" />}
          tone="violet"
          hint={`${formatNumber(stats.playlistSongs)} songs`}
        />
        <StatCard
          label="Plays"
          value={stats.plays}
          icon={<CirclePlay className="h-5 w-5" />}
          tone="cyan"
          hint={`${formatNumber(stats.events)} events`}
        />
        <StatCard
          label="Searches"
          value={stats.searches}
          icon={<Search className="h-5 w-5" />}
          tone="amber"
          hint="Logged queries"
        />
        <StatCard
          label="Cached songs"
          value={stats.knownSongs}
          icon={<Database className="h-5 w-5" />}
          tone="blue"
          hint={stats.lastKnownSongAt ? `Seen ${timeAgo(stats.lastKnownSongAt)}` : "None yet"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="surface min-w-0 p-4 sm:p-5">
          <Tabs
            aria-label="User details"
            color="primary"
            variant="underlined"
            classNames={{
              base: "w-full min-w-0",
              tabList: "w-full gap-4 border-b border-white/[0.06] sm:gap-5",
              panel: "min-w-0",
              tab: "h-10 px-0 text-[12px]",
              cursor: "bg-violet-500",
            }}
          >
            <Tab key="listening" title="Listening">
              <div className="mt-4 space-y-6">
                <div>
                  <SectionLabel icon={<Music2 className="h-4 w-4" />} title="Top tracks" />
                  {topSongs.length ? (
                    <div className="mt-3 space-y-1">
                      {topSongs.map((row) => (
                        <div
                          key={row.songId}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.02]"
                        >
                          <SongMedia song={row.song} subtitle={row.song?.artist} className="flex-1" />
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Chip size="sm" variant="flat" className="h-5 bg-violet-500/10 text-[9px] text-violet-300">
                              {formatNumber(row.plays)} plays
                            </Chip>
                            {row.skips ? (
                              <Chip size="sm" variant="flat" className="h-5 bg-amber-500/10 text-[9px] text-amber-300">
                                {formatNumber(row.skips)} skips
                              </Chip>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No listening history yet" className="mt-3 py-8" />
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <SectionLabel icon={<UsersIcon />} title="Top artists" />
                    <div className="mt-3">
                      {topArtists.length ? (
                        <BarList
                          items={topArtists.map((artist) => ({
                            name: artist.name,
                            count: artist.plays || artist.events,
                          }))}
                          color="from-fuchsia-500 to-violet-400"
                        />
                      ) : (
                        <EmptyState title="No artist signal" className="py-8" />
                      )}
                    </div>
                  </div>
                  <div>
                    <SectionLabel icon={<Search className="h-4 w-4" />} title="Recent searches" />
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {data.searches.length ? (
                        data.searches.map((row, index) => (
                          <Chip
                            key={`${row.q}-${index}`}
                            size="sm"
                            variant="flat"
                            className="bg-default-100/10 text-[10px] text-default-300"
                          >
                            {row.q}
                          </Chip>
                        ))
                      ) : (
                        <p className="text-[11px] text-default-600">No searches recorded.</p>
                      )}
                    </div>

                    <div className="mt-6">
                      <SectionLabel icon={<Activity className="h-4 w-4" />} title="Event mix" />
                      <div className="mt-3 space-y-2">
                        {data.eventKinds.length ? (
                          data.eventKinds.map((row) => {
                            const meta = EVENT_KIND_META[row.kind] ?? {
                              label: row.kind,
                              color: "default",
                            };
                            return (
                              <div key={row.kind} className="flex items-center justify-between">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={meta.color}
                                  className="h-5 text-[9px]"
                                >
                                  {meta.label}
                                </Chip>
                                <span className="text-[11px] tabular-nums text-default-500">
                                  {formatNumber(row.count)}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-[11px] text-default-600">No events recorded.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionLabel icon={<Clock3 className="h-4 w-4" />} title="Recent activity" />
                  {data.recentEvents.length ? (
                    <div className="mt-3 space-y-2">
                      {data.recentEvents.map((event) => {
                        const meta = EVENT_KIND_META[event.kind] ?? {
                          label: event.kind,
                          color: "default",
                        };
                        return (
                          <div
                            key={event.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-content2/30 px-3 py-2.5"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <Chip size="sm" variant="flat" color={meta.color} className="h-5 shrink-0 text-[9px]">
                                {meta.label}
                              </Chip>
                              <p className="truncate text-[11px] text-default-400">
                                {event.q
                                  ? `Searched “${event.q}”`
                                  : event.song?.title
                                    ? `${event.song.title}${event.song.artist ? ` · ${event.song.artist}` : ""}`
                                    : event.songId || "Track"}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-default-600">
                              {formatDateTime(event.at)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState title="No events yet" className="mt-3 py-8" />
                  )}
                </div>
              </div>
            </Tab>

            <Tab key="library" title="Library">
              <div className="mt-4 space-y-6">
                <div>
                  <SectionLabel icon={<Heart className="h-4 w-4" />} title="Liked songs" />
                  {liked.length ? (
                    <div className="mt-3 grid gap-1 md:grid-cols-2">
                      {liked.map((row) => (
                        <div key={row.id} className="rounded-xl px-2 py-1.5 transition hover:bg-white/[0.02]">
                          <SongMedia song={row.song} subtitle={row.song?.artist} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No liked songs" className="mt-3 py-8" />
                  )}
                </div>

                <div>
                  <SectionLabel icon={<ListMusic className="h-4 w-4" />} title="Playlists" />
                  {playlists.length ? (
                    <div className="mt-3 space-y-2">
                      {playlists.map((list) => (
                        <div
                          key={list.id}
                          className="rounded-xl border border-white/[0.05] bg-content2/30 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-[12px] font-medium text-default-200">{list.name}</p>
                            <Chip size="sm" variant="flat" className="h-5 bg-violet-500/10 text-[9px] text-violet-300">
                              {formatNumber(list.songCount)} songs
                            </Chip>
                          </div>
                          {list.preview.length ? (
                            <p className="mt-1 truncate text-[10px] text-default-600">
                              {list.preview.map((song) => song?.title).filter(Boolean).join(" · ")}
                            </p>
                          ) : (
                            <p className="mt-1 text-[10px] text-default-600">Empty playlist</p>
                          )}
                          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-default-600">
                            Created {formatDate(list.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No playlists" className="mt-3 py-8" />
                  )}
                </div>
              </div>
            </Tab>

            <Tab key="sessions" title={`Sessions (${stats.sessions})`}>
              <div className="mt-4">
                {sessions.length ? (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col gap-2 rounded-xl border border-white/[0.05] bg-content2/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[11px] text-default-300">{session.ip || "No IP"}</span>
                            {session.country ? (
                              <CountryBadge code={session.country} name={session.city || session.countryName} />
                            ) : null}
                            <Chip
                              size="sm"
                              variant="flat"
                              color={session.active ? "success" : "default"}
                              className="h-5 text-[9px]"
                            >
                              {session.active ? "Active" : "Expired"}
                            </Chip>
                          </div>
                          <p className="mt-1 text-[10px] text-default-600">
                            {session.device} · {session.browser}
                            {session.browserVersion ? ` ${session.browserVersion}` : ""} · {session.os}
                          </p>
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p className="text-[10px] text-default-500">{formatDateTime(session.createdAt)}</p>
                          <p className="text-[9px] text-default-600">
                            Expires {formatDateTime(session.expiresAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No sessions" className="py-8" />
                )}
              </div>
            </Tab>
            <Tab key="payments" title="Payments">
              <UserPaymentsTab key={id} userId={id} />
            </Tab>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="border border-white/[0.06] bg-content1/70 shadow-card">
            <CardBody className="p-4">
              <h3 className="font-display text-[13px] font-semibold text-foreground">Account</h3>
              <Divider className="my-2 bg-white/[0.06]" />
              <InfoRow label="Created" value={formatDateTime(user.createdAt)} />
              <InfoRow label="Updated" value={formatDateTime(user.updatedAt)} />
              <InfoRow label="Last login" value={formatDateTime(user.lastLoginAt)} />
              <InfoRow label="Email" value={user.email || "Not set"} />
              <InfoRow label="Phone" value={user.phone || "Not set"} />
              <InfoRow label="Mongo ID" value={user.id} mono />
            </CardBody>
          </Card>

          <ProgressCard
            title="Latest sign-in context"
            description="Location is estimated from the most recent session IP."
            icon={<Globe2 className="h-4 w-4 text-cyan-300" />}
          >
            <InfoRow label="IP" value={location.ip || "—"} mono />
            <InfoRow
              label="Country"
              value={
                location.country ? (
                  <CountryBadge code={location.country} name={location.countryName} />
                ) : (
                  "Unknown"
                )
              }
            />
            <InfoRow label="Region" value={location.region || "—"} />
            <InfoRow label="City" value={location.city || "—"} />
            <InfoRow label="Device" value={device.device} />
            <InfoRow label="Browser" value={device.browser} />
            <InfoRow label="OS" value={device.os} />
          </ProgressCard>

          <ProgressCard
            title="Listening footprint"
            description="What the server has stored for this account."
            icon={<Activity className="h-4 w-4 text-violet-300" />}
          >
            <InfoRow label="First event" value={formatDateTime(stats.firstEventAt)} />
            <InfoRow label="Last event" value={formatDateTime(stats.lastEventAt)} />
            <InfoRow label="Known songs" value={formatNumber(stats.knownSongs)} />
            <InfoRow label="Playlist songs" value={formatNumber(stats.playlistSongs)} />
          </ProgressCard>
        </div>
      </div>

      <DeleteDialog
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this account?"
        description={`This permanently removes ${user.email || user.phone || "the account"} and every related document: sessions, likes, playlists, history events and known songs. It cannot be undone.`}
        confirmWord="DELETE"
        actionLabel="Delete account"
        loading={busy}
        onConfirm={deleteAccount}
      />

      <DeleteDialog
        isOpen={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Revoke every session?"
        description="All refresh tokens for this account will be deleted. The listener will have to sign in again on every device."
        confirmWord="REVOKE"
        actionLabel="Revoke sessions"
        loading={busy}
        onConfirm={revokeSessions}
      />
    </div>
  );
}

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-center gap-2 text-default-300">
      <span className="text-violet-300">{icon}</span>
      <h3 className="font-display text-[13px] font-semibold">{title}</h3>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
