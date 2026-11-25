import { useState } from "react";
import { Button, Chip, Input, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { CreditCard, RefreshCw, Search, ShieldCheck, IndianRupee, Clock3 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { ErrorState } from "../components/ErrorState";
import { PaginationBar } from "../components/PaginationBar";
import { UserCell } from "../components/UserCell";
import { useToast } from "../components/ToastProvider";
import { api } from "../lib/api";
import { useApi, useDebounced } from "../lib/useApi";
import { formatDateTime } from "../lib/format";

const money = value => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0,maximumFractionDigits:2}).format((value??0)/100);
const STATUSES={created:["Awaiting payment","default"],authorized:["Authorized","warning"],captured:["Captured","success"],failed:["Failed","danger"],order_failed:["Checkout error","danger"],partially_refunded:["Partly refunded","warning"],refunded:["Refunded","secondary"]};
function SettingsEditor({ settings, refresh }) {
  const [amount,setAmount]=useState(String(settings.amountRupees));
  const [keyId,setKeyId]=useState("");const [keySecret,setKeySecret]=useState("");const [webhookSecret,setWebhookSecret]=useState("");
  const [saving,setSaving]=useState(false);const [error,setError]=useState(null);const {push}=useToast();
  async function save(event){event.preventDefault();setSaving(true);setError(null);
    try{
      const body={amountRupees:Number(amount)};
      if(keyId||keySecret){body.keyId=keyId.trim();body.keySecret=keySecret.trim();}
      if(webhookSecret)body.webhookSecret=webhookSecret.trim();
      await api.post("/payments/settings",body);
      setKeySecret("");setKeyId("");setWebhookSecret("");refresh();
      push({type:"success",title:"Payment settings updated",description:"New checkouts use the new price and credentials. Existing orders keep their original settings."});
    }catch(e){setError(e.message)}finally{setSaving(false)}
  }
  return <form onSubmit={save} className="surface space-y-4 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Checkout settings</h2><p className="mt-1 text-xs text-default-500">New orders use these settings. Existing orders retain their price and payment credentials.</p></div><Chip color={settings.configured?"success":"warning"} variant="flat">{settings.configured?"Razorpay configured":"Not configured"}</Chip></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Input label="Customization price (₹)" type="number" min={1} max={10000} step={1} isRequired value={amount} onValueChange={setAmount} description="₹1–₹10,000 per save/send" isDisabled={saving}/>
      <Input label="New Razorpay key ID" value={keyId} onValueChange={setKeyId} placeholder="rzp_live_… or rzp_test_…" autoComplete="off" description="Leave both key fields blank to keep current keys" isDisabled={saving}/>
      <Input label="New Razorpay key secret" type="password" value={keySecret} onValueChange={setKeySecret} autoComplete="new-password" description="Encrypted on the server; never returned here" isDisabled={saving}/>
      <Input label="New webhook secret (optional)" type="password" value={webhookSecret} onValueChange={setWebhookSecret} autoComplete="new-password" description={settings.webhookConfigured?"A webhook secret is stored. Blank keeps it.":"Use the same secret in Razorpay Dashboard"} isDisabled={saving}/>
    </div>
    <p className="break-all text-xs text-default-500">Current key ID: <code>{settings.keyId||"None"}</code> · Webhook {settings.webhookConfigured?"secret configured":"not configured"}</p>
    <p className="text-xs text-default-500">New key pairs are verified with Razorpay before saving. No secret is displayed or included in payment records. Keep the server encryption key backed up.</p>
    {error?<p role="alert" className="text-sm text-danger">{error}</p>:null}
    {!settings.encryptionReady?<p role="alert" className="text-sm text-warning">Configure PAYMENT_SETTINGS_ENCRYPTION_KEY on the server before updating credentials.</p>:null}
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-default-500">{settings.updatedBy?`Updated by ${settings.updatedBy} · ${formatDateTime(settings.updatedAt)}`:"Initial configuration"}</p><Button type="submit" color="primary" isLoading={saving} isDisabled={!settings.encryptionReady || !Number.isInteger(Number(amount)) || Number(amount)<1 || Number(amount)>10000}>Save payment settings</Button></div>
  </form>;
}
export function PaymentsPage(){
  const [page,setPage]=useState(1),[search,setSearch]=useState(""),[status,setStatus]=useState("all"),[fulfillment,setFulfillment]=useState("all"),[syncing,setSyncing]=useState(null);
  const q=useDebounced(search),{push}=useToast();
  const {data,loading,error,refresh}=useApi("/payments",{params:{page,limit:20,q,paymentStatus:status,fulfillment}});
  const settings=useApi("/payments/settings");
  async function sync(id){setSyncing(id);try{await api.post(`/payments/${id}/sync`,{});refresh();push({type:"success",title:"Payment status refreshed"});}catch(e){push({type:"error",title:"Could not refresh payment",description:e.message})}finally{setSyncing(null)}}
  if(error&&!data)return <ErrorState message={error} onRetry={refresh}/>;
  const stats=data?.stats??{};
  return <div className="space-y-5">
    <PageHeader eyebrow="Support & purchases" title="Payments" description="Track voluntary support and past customization purchases, with verified Razorpay payment status." actions={<Button size="sm" variant="flat" onPress={()=>{refresh();settings.refresh()}} isLoading={loading} startContent={<RefreshCw className="h-4 w-4"/>}>Refresh</Button>}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Gross captured" value={money(stats.gross)} icon={<IndianRupee className="h-5 w-5"/>} tone="emerald" hint="Before refunds and gateway fees"/>
      <StatCard label="After refunds" value={money(stats.net)} icon={<CreditCard className="h-5 w-5"/>} tone="cyan" hint={`${money(stats.refunded)} refunded · before fees`}/>
      <StatCard label="Completed payments" value={stats.fulfilled??0} icon={<ShieldCheck className="h-5 w-5"/>} tone="violet" hint="Matched to verified payments"/>
      <StatCard label="Not completed" value={stats.pending??0} icon={<Clock3 className="h-5 w-5"/>} tone="amber" hint={`${stats.failed??0} failed/error checkouts · current filters`}/>
    </div>
    {settings.error?<ErrorState message={settings.error} onRetry={settings.refresh}/>:settings.data?<SettingsEditor key={settings.data.updatedAt??"initial"} settings={settings.data} refresh={settings.refresh}/>:<p role="status" className="text-sm text-default-500">Loading payment settings…</p>}
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap gap-3 border-b border-white/10 p-4">
        <Input aria-label="Search payments" placeholder="Name, email, Buy A Mug or Razorpay ID…" value={search} onValueChange={v=>{setSearch(v);setPage(1)}} startContent={<Search className="h-4 w-4"/>} className="w-full lg:max-w-sm" size="sm"/>
        <Select aria-label="Payment status" selectedKeys={[status]} onSelectionChange={keys=>{setStatus([...keys][0]??"all");setPage(1)}} className="w-48" size="sm" disallowEmptySelection>{[<SelectItem key="all">All payment statuses</SelectItem>,...Object.entries(STATUSES).map(([id,[label]])=><SelectItem key={id}>{label}</SelectItem>)]}</Select>
        <Select aria-label="Completion status" selectedKeys={[fulfillment]} onSelectionChange={keys=>{setFulfillment([...keys][0]??"all");setPage(1)}} className="w-44" size="sm" disallowEmptySelection><SelectItem key="all">All payments</SelectItem><SelectItem key="fulfilled">Completed</SelectItem><SelectItem key="pending">Not completed</SelectItem><SelectItem key="creating">Starting checkout</SelectItem></Select>
      </div>
      {error?<p role="alert" className="p-4 text-sm text-danger">{error}</p>:null}
      <div className="overflow-x-auto">
        <Table aria-label="Payments" removeWrapper className="min-w-[960px]" classNames={{th:"text-[10px] uppercase tracking-wider",td:"py-4 align-top"}}>
          <TableHeader><TableColumn>PURPOSE / DATE</TableColumn><TableColumn>PAYER → RECIPIENT</TableColumn><TableColumn>AMOUNT</TableColumn><TableColumn>PAYMENT / COMPLETION</TableColumn><TableColumn>RAZORPAY REFERENCES</TableColumn><TableColumn>CHECK</TableColumn></TableHeader>
          <TableBody items={data?.items??[]} isLoading={loading} emptyContent="No payments match these filters.">
            {p=><TableRow key={p.id}>
              <TableCell><p className="max-w-48 break-words text-sm font-medium">{p.title}</p><p className="mt-1 text-[11px] text-default-500">{formatDateTime(p.createdAt)}</p>{p.fulfilledAt?<p className="mt-1 text-[10px] text-default-500">Completed {formatDateTime(p.fulfilledAt)}</p>:null}</TableCell>
              <TableCell><div className="space-y-3">{p.payer?<UserCell user={p.payer}/>:<span className="text-xs text-default-500">Payer account removed</span>}<div className="text-[10px] uppercase text-default-500">For</div>{p.recipient?<UserCell user={p.recipient}/>:<span className="text-xs text-default-500">{p.purpose === "donation" ? "Support for Zyrava" : "Recipient account removed"}</span>}</div></TableCell>
              <TableCell><strong>{money(p.amount)}</strong>{p.amountRefunded>0?<p className="mt-1 text-xs text-default-500">{money(p.amountRefunded)} refunded</p>:null}</TableCell>
              <TableCell><Chip size="sm" variant="flat" color={STATUSES[p.paymentStatus]?.[1]??"default"}>{STATUSES[p.paymentStatus]?.[0]??p.paymentStatus}</Chip><p className="mt-2 text-xs text-default-500">{p.fulfillmentStatus==="fulfilled"?(p.purpose === "donation" ? "Support received" : "Design saved"):p.fulfillmentStatus==="creating"?"Starting checkout":"Not completed"}</p>{p.failureCode?<p className="mt-1 text-[10px] text-danger">{p.failureCode}</p>:null}</TableCell>
              <TableCell><p className="font-mono text-[10px]">{p.orderId??"No order created"}</p><p className="mt-2 font-mono text-[10px] text-default-500">{p.paymentId??"No payment yet"}</p><p className="mt-2 text-[10px] text-default-500">Checked {formatDateTime(p.lastCheckedAt)}</p></TableCell>
              <TableCell><Button size="sm" variant="flat" isDisabled={!p.orderId||!!syncing} isLoading={syncing===p.id} onPress={()=>sync(p.id)}>Sync status</Button></TableCell>
            </TableRow>}
          </TableBody>
        </Table>
      </div>
      <PaginationBar page={data?.page??page} pages={data?.pages??1} total={data?.total??0} limit={20} onChange={setPage}/>
    </div>
    <p className="text-xs text-default-500">Totals follow the selected filters and represent captured payments, not bank settlements. Webhooks update records automatically when configured. Sync status reads Razorpay and can confirm received support or finish an already-paid design; it does not capture an authorization or issue a refund.</p>
  </div>;
}
