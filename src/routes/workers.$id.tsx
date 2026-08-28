import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDemoState } from "@/lib/demo-store";
import { attendanceForMonth, calcPayroll, money, monthLabel, recentMonths } from "@/lib/payroll";

export const Route = createFileRoute("/workers/$id")({
  head: () => ({
    meta: [
      { title: "Worker profile — Ocean Workforce" },
      {
        name: "description",
        content: "Worker profile with permit documents, monthly timesheets and payroll breakdown.",
      },
      { property: "og:title", content: "Worker profile — Ocean Workforce" },
      {
        property: "og:description",
        content: "Worker profile with permit documents, timesheets and payroll breakdown.",
      },
    ],
  }),
  component: WorkerDetail,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function WorkerDetail() {
  const { id } = Route.useParams();
  const { workers, attendance } = useDemoState();
  const worker = workers.find((w) => w.id === id);
  const month = recentMonths(1)[0]!;

  if (!worker) {
    return (
      <AppShell title="Worker not found">
        <Link to="/workers" className="text-accent hover:underline">
          Back to workers
        </Link>
      </AppShell>
    );
  }

  const records = attendanceForMonth(attendance, worker.id, month);
  const line = calcPayroll(worker, records);

  return (
    <AppShell
      title={worker.name}
      subtitle={`${worker.code} · ${worker.position} · ${worker.shipyard}`}
      actions={
        <Link
          to="/workers"
          className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="size-4" /> All workers
        </Link>
      }
    >
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="card-surface grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Worker ID" value={worker.code} />
            <Field label="Nationality" value={worker.nationality} />
            <Field label="Position" value={worker.position} />
            <Field label="Passport no." value={worker.passportNo} />
            <Field label="Passport expiry" value={worker.passportExpiry} />
            <Field label="Shipyard / client" value={worker.shipyard} />
            <Field label="Joined" value={worker.joinDate} />
            <Field label="Phone" value={worker.phone} />
            <Field label="Status" value={worker.status} />
            <Field label="Basic monthly" value={money(worker.basicMonthly)} />
            <Field label="Allowance" value={money(worker.allowanceMonthly)} />
            <Field label="OT multiplier" value={`x${worker.otMultiplier}`} />
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid gap-3 sm:grid-cols-2">
            {worker.documents.map((d) => (
              <div key={d.name} className="card-surface flex items-center gap-4 p-4">
                <span className="flex size-10 items-center justify-center rounded-md bg-secondary">
                  <FileText className="size-5 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.type}
                    {d.expiry ? ` · expires ${d.expiry}` : ""}
                  </p>
                </div>
                <Badge variant={d.status === "Valid" ? "secondary" : "destructive"}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="card-surface overflow-x-auto">
            <div className="border-b border-border px-5 py-3 text-sm text-muted-foreground">
              {monthLabel(month)} · {records.length} days · {line.normalHours.toFixed(2)} normal /{" "}
              {line.otHours.toFixed(2)} OT hours
            </div>
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5 text-left font-medium">Date</th>
                  <th className="px-5 py-2.5 text-left font-medium">In</th>
                  <th className="px-5 py-2.5 text-left font-medium">Out</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                  <th className="px-5 py-2.5 text-right font-medium">Normal</th>
                  <th className="px-5 py-2.5 text-right font-medium">OT</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="tabular px-5 py-2.5">{r.date}</td>
                    <td className="tabular px-5 py-2.5">{r.timeIn}</td>
                    <td className="tabular px-5 py-2.5">{r.timeOut}</td>
                    <td className="tabular px-5 py-2.5 text-right">{r.totalHours.toFixed(2)}</td>
                    <td className="tabular px-5 py-2.5 text-right">{r.normalHours.toFixed(2)}</td>
                    <td className="tabular px-5 py-2.5 text-right text-accent">{r.otHours.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="payroll">
          <div className="card-surface max-w-lg p-6">
            <p className="text-sm text-muted-foreground">{monthLabel(month)}</p>
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ["Days worked", String(line.daysWorked)],
                ["Hourly rate", money(line.hourlyRate)],
                ["OT hourly rate", money(line.otHourlyRate)],
                ["Basic pay", money(line.basic)],
                ["Allowance", money(line.allowance)],
                ["Overtime pay", money(line.otPay)],
                ["Gross", money(line.gross)],
                ["Deductions", `- ${money(line.deductions)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tabular font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="bg-deep mt-5 flex items-center justify-between rounded-lg px-4 py-3 text-deep-foreground">
              <span className="text-sm">Net pay</span>
              <span className="tabular text-lg font-semibold">{money(line.net)}</span>
            </div>
            <Link to="/payroll" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
              Generate payslip in Payroll →
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
