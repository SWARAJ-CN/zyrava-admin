import { useState } from "react";
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  Globe2,
  MapPinned,
  MousePointerClick,
  RefreshCw,
  Target,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RangePicker } from "../components/RangePicker";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { TrafficChart } from "../components/TrafficChart";
import { BarList } from "../components/BarList";
import { DonutChart } from "../components/DonutChart";
import { CountryBadge } from "../components/CountryBadge";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PageSkeleton } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { formatNumber, urlHost } from "../lib/format";

export function AudiencePage() {
  const [range, setRange] = useState("30d");
  const { data, loading, error, refresh } = useApi("/audience", { params: { range } });

  if (loading && !data) return <PageSkeleton cards={4} rows={3} />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Acquisition & geography"
        title="Audience"
        description="Who arrived, where from, which link brought them, and what device they used — all derived from the visits zyrava-server records."
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
              aria-label="Refresh audience"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visits"
          value={data.totals.visits}
          icon={<MousePointerClick className="h-5 w-5" />}
          tone="violet"
          hint={`${data.range.label.toLowerCase()}`}
        />
        <StatCard
          label="Unique visitors"
          value={data.totals.visitors}
          icon={<UsersRound className="h-5 w-5" />}
          tone="cyan"
          hint="Distinct anonymous devices"
        />
        <StatCard
          label="Countries"
          value={data.totals.countries}
          icon={<Globe2 className="h-5 w-5" />}
          tone="emerald"
          hint={`${formatNumber(data.totals.cities)} cities resolved`}
        />
        <StatCard
          label="Campaigns"
          value={data.totals.campaigns}
          icon={<Target className="h-5 w-5" />}
          tone="pink"
          hint={`${formatNumber(data.totals.sources)} traffic sources`}
        />
      </div>

      <ChartCard
        title="Arrivals over time"
        description={`Daily visits and unique visitors for the ${data.range.label.toLowerCase()}.`}
        action={
          <Chip size="sm" variant="flat" className="bg-default-100/10 text-default-400">
            {data.timeline.length} days
          </Chip>
        }
      >
        <TrafficChart data={data.timeline} showUsers={false} height={300} />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Traffic sources" description="utm_source, or the referrer host when no tag exists.">
          <BarList items={data.sources} showVisitors />
        </ChartCard>
        <ChartCard title="Mediums" description="utm_medium values captured on arrival.">
          {data.mediums.length ? (
            <BarList items={data.mediums} color="from-cyan-400 to-blue-500" />
          ) : (
            <EmptyState title="No utm_medium values" className="py-8" />
          )}
        </ChartCard>
        <ChartCard title="Campaigns" description="utm_campaign values captured on arrival.">
          {data.campaigns.length ? (
            <BarList items={data.campaigns} color="from-fuchsia-500 to-rose-400" />
          ) : (
            <EmptyState title="No utm_campaign values" className="py-8" />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Top countries" description="Geolocated from the visit IP address.">
          <BarList
            items={data.countries}
            showVisitors
            renderLabel={(item) => <CountryBadge code={item.code} name={item.name} />}
          />
        </ChartCard>
        <ChartCard title="Top cities" description="Most frequent city-level arrivals.">
          {data.cities.length ? (
            <div className="overflow-x-auto">
              <Table
                aria-label="Top cities"
                removeWrapper
                classNames={{
                  th: "bg-transparent text-[10px] uppercase tracking-[0.12em] text-default-500",
                  td: "py-2.5",
                  tr: "hover:bg-white/[0.02]",
                }}
              >
                <TableHeader>
                  <TableColumn>CITY</TableColumn>
                  <TableColumn>REGION</TableColumn>
                  <TableColumn align="end">VISITS</TableColumn>
                </TableHeader>
                <TableBody items={data.cities} emptyContent={<EmptyState title="No city data" className="border-0 bg-transparent" />}>
                  {(row) => (
                    <TableRow key={`${row.city}-${row.region}-${row.country}`}>
                      <TableCell>
                        <CountryBadge code={row.country} name={row.city} />
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] text-default-500">
                          {[row.region, row.countryName].filter(Boolean).join(", ") || "—"}
                        </span>
                      </TableCell>
                      <TableCell align="end">
                        <span className="text-[12px] tabular-nums text-default-300">
                          {formatNumber(row.count)}
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState title="No city data in this range" className="py-8" />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Devices" description="Desktop, mobile, tablet and bots.">
          <DonutChart data={data.devices} label="arrivals" />
        </ChartCard>
        <ChartCard title="Browsers" description="Derived from the stored user agent.">
          <DonutChart data={data.browsers} label="arrivals" />
        </ChartCard>
        <ChartCard title="Operating systems" description="Platform of each recorded arrival.">
          <BarList items={data.operatingSystems} color="from-emerald-400 to-cyan-400" />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Referrers" description="Full referrer hosts, including direct traffic.">
          <BarList
            items={data.referrers}
            renderLabel={(item) => (
              <span className="truncate" title={item.name}>
                {item.name === "Direct / none" ? item.name : urlHost(item.name)}
              </span>
            )}
          />
        </ChartCard>
        <ChartCard title="Landing pages" description="Paths captured at the moment of arrival.">
          <BarList
            items={data.landingPages}
            renderLabel={(item) => (
              <span className="truncate font-mono text-[10px]" title={item.fullPath}>
                {item.name}
              </span>
            )}
            color="from-amber-400 to-orange-400"
          />
        </ChartCard>
        <ChartCard title="Languages" description="Primary accept-language of each arrival.">
          {data.languages.length ? (
            <BarList items={data.languages} color="from-blue-400 to-violet-400" />
          ) : (
            <EmptyState title="No language headers captured" className="py-8" />
          )}
        </ChartCard>
      </div>

      <div className="surface p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <MapPinned className="h-4 w-4 text-violet-300" />
          <h2 className="font-display text-[13px] font-semibold text-foreground">Regions</h2>
        </div>
        {data.regions.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {data.regions.map((region) => (
              <div
                key={`${region.region}-${region.country}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-content2/30 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <CountryBadge code={region.country} name={region.region} />
                  <span className="truncate text-[10px] text-default-600">{region.countryName}</span>
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-default-400">
                  {formatNumber(region.count)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No region data in this range" className="mt-4 py-8" />
        )}
      </div>
    </div>
  );
}
