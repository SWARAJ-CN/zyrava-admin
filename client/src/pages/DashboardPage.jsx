import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Activity,
  CirclePlay,
  Database,
  Globe2,
  Heart,
  ListMusic,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Server,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { RangePicker } from "../components/RangePicker";
import { TrafficChart } from "../components/TrafficChart";
import { BarList } from "../components/BarList";
import { DonutChart } from "../components/DonutChart";
import { CountryBadge } from "../components/CountryBadge";
import { UserCell } from "../components/UserCell";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PageSkeleton } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { formatNumber, timeAgo } from "../lib/format";

export function DashboardPage() {
  const [range, setRange] = useState("30d");
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useApi("/overview", { params: { range } });

  if (loading && !data) return <PageSkeleton cards={4} rows={2} />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const kpis = data.kpis;
  const rangeLabel = data.range.label.toLowerCase();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Command centre"
        title="Overview"
        description="A live read of every ZYRAVA account, arrival channel and listening signal. Data refreshes from MongoDB every 5 seconds."
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
              aria-label="Refresh overview"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={kpis.totalUsers}
          icon={<UsersRound className="h-5 w-5" />}
          tone="violet"
          hint={`${formatNumber(kpis.newUsers)} joined · ${formatNumber(kpis.activeUsers30d)} active 30d`}
          change={data.changes.users}
        />
        <StatCard
          label="Unique visitors"
          value={kpis.uniqueVisitors}
          icon={<MousePointerClick className="h-5 w-5" />}
          tone="cyan"
          hint={`${formatNumber(kpis.totalVisits)} visits all-time`}
          change={data.changes.visits}
        />
        <StatCard
          label="Plays recorded"
          value={kpis.totalPlays}
          icon={<CirclePlay className="h-5 w-5" />}
          tone="pink"
          hint={`${formatNumber(kpis.totalEvents)} events · ${formatNumber(kpis.totalSearches)} searches`}
        />
        <StatCard
          label="Active sessions"
          value={kpis.activeSessions}
          icon={<MonitorSmartphone className="h-5 w-5" />}
          tone="emerald"
          hint={`${formatNumber(kpis.totalSessions)} sessions all-time`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Traffic & growth"
          description={`Visits, unique visitors and new signups over the ${rangeLabel}.`}
          action={
            <Chip size="sm" variant="flat" className="bg-default-100/10 text-default-400">
              {data.series.length} days
            </Chip>
          }
        >
          <TrafficChart data={data.series} height={300} />
        </ChartCard>

        <ChartCard
          title="Acquisition"
          description="First-touch source from UTM tags, falling back to the referrer host."
        >
          <BarList items={data.sources.slice(0, 7)} showVisitors />
          <p className="mt-4 text-[10px] leading-relaxed text-default-600">
            Arrivals are stored separately from accounts, so channel attribution is visit-level —
            exactly how zyrava-server records it.
          </p>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Devices"
          description="Parsed from the stored user agent at read time."
        >
          <DonutChart data={data.devices} label="arrivals" />
        </ChartCard>

        <ChartCard
          title="Browsers"
          description="The browsers listeners arrive with."
        >
          <DonutChart data={data.browsers} label="arrivals" />
        </ChartCard>

        <ChartCard
          title="Top locations"
          description="Country-level geolocation from visit IPs."
        >
          <BarList
            items={data.locations}
            renderLabel={(item) => (
              <CountryBadge code={item.country} name={item.countryName} />
            )}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Campaigns"
          description="UTM campaign values captured in this range."
        >
          {data.campaigns.length ? (
            <BarList items={data.campaigns} color="from-cyan-400 to-blue-500" />
          ) : (
            <EmptyState title="No tagged campaigns yet" className="py-8" />
          )}
        </ChartCard>

        <ChartCard title="Top cities" description="Where the most arrivals cluster.">
          {data.cities.length ? (
            <div className="space-y-3">
              {data.cities.map((city) => (
                <div
                  key={`${city.city}-${city.country}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <CountryBadge code={city.country} name={city.city} />
                    <span className="truncate text-[10px] text-default-600">
                      {city.region ? `${city.region}, ` : ""}
                      {city.country ?? ""}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-default-400">
                    {formatNumber(city.count)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No city data in this range" className="py-8" />
          )}
        </ChartCard>

        <ChartCard title="Library snapshot" description="All-time content held by the server.">
          <div className="space-y-1">
            <LibraryRow icon={<Heart className="h-4 w-4 text-rose-400" />} label="Liked songs" value={kpis.totalLikes} />
            <LibraryRow icon={<ListMusic className="h-4 w-4 text-violet-300" />} label="Playlists" value={kpis.totalPlaylists} />
            <LibraryRow icon={<Activity className="h-4 w-4 text-cyan-300" />} label="History events" value={kpis.totalEvents} />
            <LibraryRow icon={<Globe2 className="h-4 w-4 text-amber-300" />} label="Known songs" value={data.totals.totalKnownSongs} />
          </div>
          <Divider className="my-3 bg-white/[0.06]" />
          <div className="flex items-center justify-between text-[11px] text-default-500">
            <span>Tracking window</span>
            <span className="text-default-300">{rangeLabel}</span>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Recent signups"
          description="The newest accounts created in MongoDB."
          action={
            <Button size="sm" variant="light" color="primary" onPress={() => navigate("/users")}>
              View all
            </Button>
          }
        >
          {data.recentUsers.length ? (
            <div className="divide-y divide-white/[0.05]">
              {data.recentUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left transition hover:opacity-80"
                >
                  <UserCell user={user} />
                  <span className="shrink-0 text-[10px] text-default-600">{timeAgo(user.createdAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No accounts yet" className="py-8" />
          )}
        </ChartCard>

        <ChartCard
          title="Latest arrivals"
          description="Visitor rows as recorded by the public visit endpoint."
          action={
            <Button size="sm" variant="light" color="primary" onPress={() => navigate("/visits")}>
              Open log
            </Button>
          }
        >
          {data.recentVisits.length ? (
            <div className="divide-y divide-white/[0.05]">
              {data.recentVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <CountryBadge code={visit.country} name={visit.city || visit.countryName || "Unknown"} />
                      <Chip size="sm" variant="flat" className="h-5 bg-violet-500/10 text-[9px] text-violet-300">
                        {visit.source}
                      </Chip>
                    </div>
                    <p className="mt-1 truncate text-[10px] text-default-600">{visit.path}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-default-600">{timeAgo(visit.createdAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No arrivals recorded" className="py-8" />
          )}
        </ChartCard>
      </div>

      <ChartCard title="System pulse" description="The public API and database this panel reads from.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PulseTile
            icon={<Server className="h-4 w-4" />}
            label="zyrava-server"
            value={data.server?.ok ? "Online" : "Offline"}
            tone={data.server?.ok ? "text-emerald-400" : "text-rose-400"}
            hint={`${data.server?.responseMs ?? "—"} ms · HTTP ${data.server?.status ?? "—"}`}
          />
          <PulseTile
            icon={<Database className="h-4 w-4" />}
            label="API database"
            value={data.server?.db === "up" ? "Connected" : "Unknown"}
            tone={data.server?.db === "up" ? "text-emerald-400" : "text-amber-400"}
            hint={data.server?.uptime ? `${data.server.uptime}s uptime` : "Health check unavailable"}
          />
          <PulseTile
            icon={<Sparkles className="h-4 w-4" />}
            label="Visits today"
            value={formatNumber(kpis.visitsToday)}
            tone="text-violet-300"
            hint={`${formatNumber(kpis.newUsersToday)} signups today`}
          />
          <PulseTile
            icon={<Activity className="h-4 w-4" />}
            label="Visits in range"
            value={formatNumber(kpis.rangeVisits)}
            tone="text-cyan-300"
            hint={`${formatNumber(kpis.visits7d)} in the last 7 days`}
          />
        </div>
      </ChartCard>
    </div>
  );
}

function LibraryRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="flex items-center gap-2.5 text-[12px] text-default-400">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{formatNumber(value)}</span>
    </div>
  );
}

function PulseTile({ icon, label, value, hint, tone }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-content2/40 p-3.5">
      <div className="flex items-center gap-2 text-default-500">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-default-600">{hint}</p>
    </div>
  );
}
