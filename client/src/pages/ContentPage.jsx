import { useState } from "react";
import {
  Button,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  Activity,
  CirclePlay,
  Database,
  Heart,
  ListMusic,
  Music2,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RangePicker } from "../components/RangePicker";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { BarList } from "../components/BarList";
import { SongMedia } from "../components/SongMedia";
import { UserCell } from "../components/UserCell";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PageSkeleton } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { EVENT_KIND_META } from "../lib/constants";
import { formatDateTime, formatNumber, timeAgo } from "../lib/format";

const TABLE_CLASSES = {
  th: "bg-transparent text-[10px] uppercase tracking-[0.12em] text-default-500",
  td: "py-3",
  tr: "hover:bg-white/[0.02]",
};

export function ContentPage() {
  const [range, setRange] = useState("30d");
  const { data, loading, error, refresh } = useApi("/content", { params: { range } });

  if (loading && !data) return <PageSkeleton cards={6} rows={3} />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const totals = data.totals;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Catalogue & behaviour"
        title="Content"
        description="What listeners save, build, play and search for. Library totals are all-time; listening activity follows the selected range."
        actions={
          <>
            <RangePicker value={range} onChange={setRange} />
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-content2/80"
              onPress={refresh}
              isLoading={loading}
              aria-label="Refresh content"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Liked songs"
          value={totals.likes}
          icon={<Heart className="h-5 w-5" />}
          tone="pink"
          hint={`${formatNumber(totals.uniqueLikedSongs)} unique tracks`}
        />
        <StatCard
          label="Playlists"
          value={totals.playlists}
          icon={<ListMusic className="h-5 w-5" />}
          tone="violet"
          hint={`${formatNumber(totals.playlistSongs)} songs across lists`}
        />
        <StatCard
          label="History events"
          value={totals.events}
          icon={<Activity className="h-5 w-5" />}
          tone="cyan"
          hint={`${formatNumber(totals.plays)} listens all-time`}
        />
        <StatCard
          label="Known songs"
          value={totals.knownSongs}
          icon={<Database className="h-5 w-5" />}
          tone="emerald"
          hint="Cached snapshots per account"
        />
        <StatCard
          label="Searches"
          value={totals.searches}
          icon={<Search className="h-5 w-5" />}
          tone="amber"
          hint="Phrases stored in history"
        />
        <StatCard
          label="Plays in range"
          value={data.topPlayed.reduce((sum, row) => sum + row.plays, 0)}
          icon={<CirclePlay className="h-5 w-5" />}
          tone="blue"
          hint={`Top ${data.topPlayed.length} tracks shown below`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Top artists" description="Ranked by likes across every account.">
          {data.topArtists.length ? (
            <BarList
              items={data.topArtists.map((artist) => ({ name: artist.name, count: artist.likes }))}
              color="from-fuchsia-500 to-violet-400"
            />
          ) : (
            <EmptyState title="No likes yet" className="py-8" />
          )}
        </ChartCard>
        <ChartCard title="Languages" description="Language mix across liked songs.">
          {data.topLanguages.length ? (
            <BarList items={data.topLanguages} color="from-cyan-400 to-blue-500" />
          ) : (
            <EmptyState title="No language metadata" className="py-8" />
          )}
        </ChartCard>
      </div>

      <div className="surface p-4 sm:p-5">
        <Tabs
          aria-label="Content breakdown"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-5 overflow-x-auto border-b border-white/[0.06]",
            tab: "h-10 whitespace-nowrap px-0 text-[12px]",
            cursor: "bg-violet-500",
          }}
        >
          <Tab key="songs" title="Top liked songs">
            {data.topSongs.length ? (
              <Table aria-label="Top liked songs" removeWrapper classNames={TABLE_CLASSES} className="mt-3">
                <TableHeader>
                  <TableColumn>TRACK</TableColumn>
                  <TableColumn>LANGUAGE</TableColumn>
                  <TableColumn align="end">LIKES</TableColumn>
                  <TableColumn align="end">LISTENERS</TableColumn>
                </TableHeader>
                <TableBody items={data.topSongs} emptyContent={<EmptyState title="No liked songs" className="border-0 bg-transparent" />}>
                  {(row) => (
                    <TableRow key={row.song?.id ?? row.song?.title}>
                      <TableCell>
                        <SongMedia song={row.song} />
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] text-default-500">{row.song?.language || "—"}</span>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[12px] font-medium tabular-nums text-rose-300">
                          {formatNumber(row.likes)}
                        </span>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[11px] tabular-nums text-default-400">
                          {formatNumber(row.users)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No liked songs yet" className="mt-4 py-8" />
            )}
          </Tab>

          <Tab key="played" title="Most played">
            {data.topPlayed.length ? (
              <Table aria-label="Most played tracks" removeWrapper classNames={TABLE_CLASSES} className="mt-3">
                <TableHeader>
                  <TableColumn>TRACK</TableColumn>
                  <TableColumn align="end">PLAYS</TableColumn>
                  <TableColumn align="end">LISTENERS</TableColumn>
                  <TableColumn className="hidden sm:table-cell" align="end">LAST HEARD</TableColumn>
                </TableHeader>
                <TableBody items={data.topPlayed}>
                  {(row) => (
                    <TableRow key={row.songId}>
                      <TableCell>
                        <SongMedia song={row.song} meta={row.songId} />
                      </TableCell>
                      <TableCell align="end">
                        <Chip size="sm" variant="flat" className="h-5 bg-violet-500/10 text-[9px] text-violet-300">
                          {formatNumber(row.plays)}
                        </Chip>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[11px] tabular-nums text-default-400">
                          {formatNumber(row.listeners)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell" align="end">
                        <span className="text-[10px] text-default-500">{timeAgo(row.last)}</span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No plays in this range" className="mt-4 py-8" />
            )}
          </Tab>

          <Tab key="playlists" title="Playlists">
            {data.topPlaylists.length ? (
              <Table aria-label="Top playlists" removeWrapper classNames={TABLE_CLASSES} className="mt-3">
                <TableHeader>
                  <TableColumn>PLAYLIST NAME</TableColumn>
                  <TableColumn align="end">SONGS</TableColumn>
                  <TableColumn align="end">OWNERS</TableColumn>
                </TableHeader>
                <TableBody items={data.topPlaylists}>
                  {(row) => (
                    <TableRow key={row.name}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
                            <ListMusic className="h-4 w-4" />
                          </div>
                          <span className="text-[12px] font-medium text-default-200">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[11px] tabular-nums text-default-400">{formatNumber(row.songs)}</span>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[11px] tabular-nums text-default-400">{formatNumber(row.owners)}</span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No playlists yet" className="mt-4 py-8" />
            )}
          </Tab>

          <Tab key="searches" title="Search phrases">
            {data.searches.length ? (
              <Table aria-label="Search phrases" removeWrapper classNames={TABLE_CLASSES} className="mt-3">
                <TableHeader>
                  <TableColumn>PHRASE</TableColumn>
                  <TableColumn align="end">SEARCHES</TableColumn>
                  <TableColumn align="end">LAST SEARCHED</TableColumn>
                </TableHeader>
                <TableBody items={data.searches}>
                  {(row) => (
                    <TableRow key={row.q}>
                      <TableCell>
                        <span className="text-[12px] text-default-300">{row.q}</span>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[11px] tabular-nums text-default-400">{formatNumber(row.count)}</span>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[10px] text-default-500">{timeAgo(row.lastAt)}</span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No searches in this range" className="mt-4 py-8" />
            )}
          </Tab>

          <Tab key="events" title="Recent activity">
            {data.recentEvents.length ? (
              <div className="mt-4 space-y-2">
                {data.recentEvents.map((event) => {
                  const meta = EVENT_KIND_META[event.kind] ?? { label: event.kind, color: "default" };
                  return (
                    <div
                      key={event.id}
                      className="flex flex-col gap-2 rounded-xl border border-white/[0.05] bg-content2/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
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
                      <div className="flex shrink-0 items-center gap-3">
                        {event.user ? (
                          <UserCell user={event.user} size="sm" />
                        ) : (
                          <span className="text-[10px] text-default-600">Unknown user</span>
                        )}
                        <span className="text-[9px] text-default-600">{formatDateTime(event.at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No activity in this range" className="mt-4 py-8" />
            )}
          </Tab>
        </Tabs>
      </div>

      <div className="surface p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-300" />
          <h2 className="font-display text-[13px] font-semibold text-foreground">Event mix in range</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.eventKinds.length ? (
            data.eventKinds.map((row) => {
              const meta = EVENT_KIND_META[row.kind] ?? { label: row.kind, color: "default" };
              return (
                <Chip
                  key={row.kind}
                  size="sm"
                  variant="flat"
                  color={meta.color}
                  startContent={<Music2 className="ml-1 h-3 w-3" />}
                  className="text-[10px]"
                >
                  {meta.label} · {formatNumber(row.count)}
                </Chip>
              );
            })
          ) : (
            <p className="text-[11px] text-default-600">No events recorded in this range.</p>
          )}
        </div>
      </div>
    </div>
  );
}
