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
  Activity,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  Timer,
  Trash2,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { ChartCard } from "../components/ChartCard";
import { ProgressCard } from "../components/ProgressCard";
import { InfoRow } from "../components/InfoRow";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { PageSkeleton } from "../components/Loading";
import { useApi } from "../lib/useApi";
import { formatDateTime, formatFullNumber, formatNumber } from "../lib/format";

export function SystemPage() {
  const { data, loading, error, refresh } = useApi("/system");

  if (loading && !data) return <PageSkeleton cards={4} rows={2} />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const { database, config, process: runtime, cache, admin } = data;
  const dbUp = database.status === "up";
  const uptimeMinutes = Math.floor((runtime.uptimeSeconds ?? 0) / 60);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations"
        title="System health"
        description="The existing zyrava-server process, its MongoDB connection, and the collections the admin console reads."
        actions={
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="bg-content2/80"
            onPress={refresh}
            isLoading={loading}
            aria-label="Refresh system health"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Database"
          value={dbUp ? "Connected" : "Down"}
          icon={<Database className="h-5 w-5" />}
          tone={dbUp ? "emerald" : "pink"}
          hint={`${database.name ?? "unknown"} · ping ${formatNumber(database.latencyMs)} ms`}
        />
        <StatCard
          label="Admin routes"
          value="Live"
          icon={<ServerCog className="h-5 w-5" />}
          tone="violet"
          hint="Mounted in zyrava-server at /api/admin"
        />
        <StatCard
          label="Process uptime"
          value={uptimeMinutes >= 60 ? `${Math.floor(uptimeMinutes / 60)}h` : `${uptimeMinutes}m`}
          icon={<Timer className="h-5 w-5" />}
          tone="cyan"
          hint={`${formatDateTime(data.generatedAt)} snapshot`}
        />
        <StatCard
          label="Heap used"
          value={`${formatNumber(runtime.heapUsedMb)} MB`}
          icon={<Cpu className="h-5 w-5" />}
          tone="amber"
          hint={`${formatNumber(runtime.rssMb)} MB RSS`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="MongoDB collections"
          description="Estimated document counts. Unknown collections are shown too, so nothing is hidden."
        >
          {database.collections.length ? (
            <Table
              aria-label="MongoDB collections"
              removeWrapper
              classNames={{
                th: "bg-transparent text-[10px] uppercase tracking-[0.12em] text-default-500",
                td: "py-2.5",
                tr: "hover:bg-white/[0.02]",
              }}
            >
              <TableHeader>
                <TableColumn>COLLECTION</TableColumn>
                <TableColumn>USED BY</TableColumn>
                <TableColumn align="end">DOCUMENTS</TableColumn>
              </TableHeader>
              <TableBody items={database.collections}>
                {(row) => (
                  <TableRow key={row.name}>
                    <TableCell>
                      <span className="font-mono text-[11px] text-default-300">{row.name}</span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={row.known ? "success" : "default"}
                        className="h-5 text-[9px]"
                      >
                        {row.known ? "Admin" : "Server only"}
                      </Chip>
                    </TableCell>
                    <TableCell align="end">
                      <span className="text-[11px] tabular-nums text-default-400">
                        {row.documents === null ? "—" : formatFullNumber(row.documents)}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No collections visible" className="py-8" />
          )}
        </ChartCard>

        <div className="space-y-4">
          <ProgressCard
            title="Runtime configuration"
            description="Read from environment variables on zyrava-server."
            icon={<ServerCog className="h-4 w-4 text-violet-300" />}
          >
            <InfoRow label="Environment" value={config.environment} />
            <InfoRow label="Node" value={config.node} mono />
            <InfoRow label="Admin" value={admin.email || "Not configured"} />
            <InfoRow label="Session TTL" value={`${config.adminSessionHours} hours`} />
            <InfoRow label="Cache TTL" value={`${formatNumber(config.cacheTtlMs)} ms`} />
            <InfoRow label="Cache entries" value={formatNumber(cache.entries)} />
          </ProgressCard>

          <ProgressCard
            title="Destructive actions"
            description="Server-side gate for DELETE requests."
            icon={
              config.allowDelete ? (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <Trash2 className="h-4 w-4 text-default-500" />
              )
            }
          >
            <InfoRow
              label="Deletes"
              value={
                <Chip
                  size="sm"
                  variant="flat"
                  color={config.allowDelete ? "success" : "default"}
                  className="h-5 text-[9px]"
                >
                  {config.allowDelete ? "Enabled" : "Read-only"}
                </Chip>
              }
            />
            <InfoRow label="Guard" value="Typed confirmation" />
            <InfoRow label="Admin API" value="/api/admin" mono />
            <InfoRow label="Public API" value={config.apiUrl} mono />
          </ProgressCard>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="How this deployment works"
          description="No second backend process and no database credentials in the browser."
        >
          <div className="space-y-3">
            <Fact
              icon={<Database className="h-4 w-4 text-emerald-400" />}
              title="One Express server"
              text="These routes are mounted inside the existing zyrava-server at /api/admin. The public auth, library and visit routes are untouched."
            />
            <Fact
              icon={<ShieldCheck className="h-4 w-4 text-violet-300" />}
              title="Admin JWT"
              text="Sign-in compares ADMIN_EMAIL and ADMIN_PASSWORD on the server, then issues a short-lived admin token. The browser only stores that token."
            />
            <Fact
              icon={<HardDrive className="h-4 w-4 text-cyan-300" />}
              title="Direct MongoDB reads"
              text="Aggregations use the same pooled connection as the API, with autoIndex disabled for the admin queries. Password hashes are never projected."
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Process"
          description="Memory and uptime for the shared Node process."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric
              icon={<Timer className="h-4 w-4" />}
              label="Uptime"
              value={`${formatNumber(runtime.uptimeSeconds)} s`}
            />
            <Metric
              icon={<Cpu className="h-4 w-4" />}
              label="Heap"
              value={`${formatNumber(runtime.heapUsedMb)} MB`}
            />
            <Metric
              icon={<Activity className="h-4 w-4" />}
              label="RSS"
              value={`${formatNumber(runtime.rssMb)} MB`}
            />
            <Metric
              icon={<Database className="h-4 w-4" />}
              label="DB latency"
              value={`${formatNumber(database.latencyMs)} ms`}
            />
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-default-600">
            Snapshot generated {formatDateTime(data.generatedAt)}. Admin responses are cached for{" "}
            {formatNumber(config.cacheTtlMs)} ms to protect the free-tier database.
          </p>
        </ChartCard>
      </div>
    </div>
  );
}

function Fact({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-content2/30 p-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[12px] font-medium text-default-200">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-default-500">{text}</p>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-content2/40 p-3.5">
      <div className="flex items-center gap-2 text-default-500">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
