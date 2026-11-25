import { useState } from "react";
import {
  Button,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  Fingerprint,
  Globe2,
  MapPin,
  MousePointerClick,
  RefreshCw,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { RangePicker } from "../components/RangePicker";
import { PaginationBar } from "../components/PaginationBar";
import { TableSkeleton } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { CountryBadge } from "../components/CountryBadge";
import { DeviceIcon } from "../components/DeviceIcon";
import { InfoRow } from "../components/InfoRow";
import { useApi, useDebounced } from "../lib/useApi";
import { formatDateTime, formatNumber, shortId, timeAgo, urlHost } from "../lib/format";

export function VisitsPage() {
  const [range, setRange] = useState("30d");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [country, setCountry] = useState("all");
  const [detail, setDetail] = useState(null);
  const q = useDebounced(search);

  const meta = useApi("/visits/meta");
  const { data, loading, error, refresh } = useApi("/visits", {
    params: { page, limit: 20, q, source, country, range },
  });

  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Raw arrivals"
        title="Visitor log"
        description="One row per arrival recorded by the public visit endpoint, with geolocation, UTM attribution and parsed device details."
        actions={
          <>
            <RangePicker value={range} onChange={(value) => { setRange(value); setPage(1); }} />
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-content2/80"
              onPress={refresh}
              isLoading={loading}
              aria-label="Refresh visits"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Chip size="sm" variant="flat" className="bg-violet-500/10 text-violet-300" startContent={<MousePointerClick className="ml-1 h-3 w-3" />}>
          {formatNumber(data?.stats.total ?? 0)} visits
        </Chip>
        <Chip size="sm" variant="flat" className="bg-cyan-500/10 text-cyan-300" startContent={<UsersRound className="ml-1 h-3 w-3" />}>
          {formatNumber(data?.stats.visitors ?? 0)} visitors
        </Chip>
        <Chip size="sm" variant="flat" className="bg-emerald-500/10 text-emerald-300" startContent={<Globe2 className="ml-1 h-3 w-3" />}>
          {formatNumber(data?.stats.countries ?? 0)} countries
        </Chip>
      </div>

      <div className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 xl:flex-row xl:items-center">
          <Input
            size="sm"
            placeholder="Search IP, city, source, campaign, path…"
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            startContent={<Search className="h-4 w-4 text-default-500" />}
            className="xl:max-w-md"
            variant="bordered"
            classNames={{ inputWrapper: "border-white/10 bg-content2/40" }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              size="sm"
              aria-label="Filter by source"
              selectedKeys={[source]}
              onSelectionChange={(keys) => {
                setSource(Array.from(keys)[0] ?? "all");
                setPage(1);
              }}
              disallowEmptySelection
              className="w-44"
              classNames={{ trigger: "border-white/10 bg-content2/40" }}
            >
              <SelectItem key="all">All sources</SelectItem>
              {(meta.data?.sources ?? []).map((row) => (
                <SelectItem key={row.value}>{row.label}</SelectItem>
              ))}
            </Select>
            <Select
              size="sm"
              aria-label="Filter by country"
              selectedKeys={[country]}
              onSelectionChange={(keys) => {
                setCountry(Array.from(keys)[0] ?? "all");
                setPage(1);
              }}
              disallowEmptySelection
              className="w-48"
              classNames={{ trigger: "border-white/10 bg-content2/40" }}
            >
              <SelectItem key="all">All countries</SelectItem>
              {(meta.data?.countries ?? []).map((row) => (
                <SelectItem key={row.value}>{row.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <Table
          aria-label="Visitor log"
          removeWrapper
          isStriped
          classNames={{
            th: "bg-transparent text-[10px] uppercase tracking-[0.12em] text-default-500",
            td: "py-3",
            tr: "hover:bg-white/[0.02]",
          }}
        >
          <TableHeader>
            <TableColumn className="hidden sm:table-cell">TIME</TableColumn>
            <TableColumn>VISITOR</TableColumn>
            <TableColumn>LOCATION</TableColumn>
            <TableColumn className="hidden lg:table-cell">ACQUISITION</TableColumn>
            <TableColumn className="hidden md:table-cell">DEVICE</TableColumn>
            <TableColumn className="hidden xl:table-cell">LANDING PAGE</TableColumn>
            <TableColumn className="hidden 2xl:table-cell">IP</TableColumn>
          </TableHeader>
          <TableBody
            items={items}
            isLoading={loading}
            loadingContent={<TableSkeleton />}
            emptyContent={
              <EmptyState
                title="No arrivals match these filters"
                description="Try widening the date range or clearing the search."
                className="border-0 bg-transparent"
              />
            }
          >
            {(visit) => (
              <TableRow
                key={visit.id}
                className="cursor-pointer"
                onClick={() => setDetail(visit)}
              >
                <TableCell className="hidden sm:table-cell">
                  <p className="text-[11px] text-default-300">{timeAgo(visit.createdAt)}</p>
                  <p className="text-[9px] text-default-600">{formatDateTime(visit.createdAt)}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-400/15 text-violet-300">
                      <Fingerprint className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-default-300">
                        {shortId(visit.clientId, 10)}
                      </p>
                      <p className="text-[9px] text-default-600">{visit.language || "no language"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CountryBadge
                    code={visit.country}
                    name={visit.city || visit.countryName || "Unknown"}
                  />
                  <p className="mt-0.5 text-[9px] text-default-600">
                    {[visit.region, visit.countryName].filter(Boolean).join(", ") || "No geolocation"}
                  </p>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap items-center gap-1">
                    <Chip
                      size="sm"
                      variant="flat"
                      className="h-5 bg-violet-500/10 text-[9px] text-violet-300"
                    >
                      {visit.source}
                    </Chip>
                    {visit.medium ? (
                      <Chip size="sm" variant="flat" className="h-5 bg-cyan-500/10 text-[9px] text-cyan-300">
                        {visit.medium}
                      </Chip>
                    ) : null}
                  </div>
                  {visit.campaign ? (
                    <p className="mt-0.5 truncate text-[9px] text-default-600">{visit.campaign}</p>
                  ) : null}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-[11px] text-default-400">
                    <DeviceIcon name={visit.device} className="h-3.5 w-3.5 text-default-500" />
                    {visit.device}
                  </div>
                  <p className="text-[9px] text-default-600">
                    {visit.browser} · {visit.os}
                  </p>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <p className="max-w-56 truncate font-mono text-[10px] text-default-500" title={visit.path}>
                    {visit.path}
                  </p>
                  <p className="max-w-56 truncate text-[9px] text-default-600">{urlHost(visit.referrer)}</p>
                </TableCell>
                <TableCell className="hidden 2xl:table-cell">
                  <span className="font-mono text-[10px] text-default-500">{visit.ip}</span>
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

      <Drawer
        isOpen={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
        size="md"
        placement="right"
        backdrop="blur"
        classNames={{ base: "bg-content1 border-l border-white/[0.08]" }}
      >
        <DrawerContent>
          {(onClose) =>
            detail ? (
              <>
                <DrawerHeader className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-default-500">
                      Visit detail
                    </p>
                    <p className="truncate font-display text-lg font-semibold text-foreground">
                      {detail.city || detail.countryName || "Anonymous arrival"}
                    </p>
                  </div>
                  <Button isIconOnly size="sm" variant="light" onPress={onClose} aria-label="Close">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerHeader>
                <DrawerBody className="space-y-5">
                  <div className="rounded-2xl border border-white/[0.06] bg-content2/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-cyan-400/10 text-violet-300">
                        <Fingerprint className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] text-default-300">{detail.clientId}</p>
                        <p className="text-[10px] text-default-600">{formatDateTime(detail.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <Section title="Acquisition">
                    <InfoRow label="Source" value={detail.source} />
                    <InfoRow label="Medium" value={detail.medium || "—"} />
                    <InfoRow label="Campaign" value={detail.campaign || "—"} />
                    <InfoRow label="Referrer" value={detail.referrer ? urlHost(detail.referrer) : "Direct / none"} />
                    <InfoRow label="Landing path" value={detail.path} mono />
                  </Section>

                  <Section title="Location">
                    <InfoRow
                      label="Country"
                      value={
                        detail.country ? (
                          <CountryBadge code={detail.country} name={detail.countryName} />
                        ) : (
                          "Unknown"
                        )
                      }
                    />
                    <InfoRow label="Region" value={detail.region || "—"} />
                    <InfoRow label="City" value={detail.city || "—"} />
                    <InfoRow label="IP address" value={detail.ip} mono />
                  </Section>

                  <Section title="Device">
                    <InfoRow label="Device" value={detail.device} />
                    <InfoRow label="Browser" value={`${detail.browser}${detail.browserVersion ? ` ${detail.browserVersion}` : ""}`} />
                    <InfoRow label="Operating system" value={detail.os} />
                    <InfoRow label="Language" value={detail.language || "—"} />
                  </Section>

                  <Section title="User agent">
                    <p className="break-words rounded-xl border border-white/[0.05] bg-content2/40 p-3 font-mono text-[10px] leading-relaxed text-default-500">
                      {detail.userAgent || "Not recorded"}
                    </p>
                  </Section>
                </DrawerBody>
                <DrawerFooter>
                  <Button variant="flat" onPress={onClose}>
                    Close
                  </Button>
                </DrawerFooter>
              </>
            ) : null
          }
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-default-500">
        <MapPin className="h-3.5 w-3.5" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">{title}</p>
      </div>
      <div className="divide-y divide-white/[0.04]">{children}</div>
    </div>
  );
}
