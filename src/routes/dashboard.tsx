import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, Clock, Timer, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { useDemoState } from "@/lib/demo-store";
import { calcPayroll, money, monthKey, monthLabel, recentMonths, round } from "@/lib/payroll";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Ocean Workforce" },
      {
        name: "description",
        content:
          "Live shipyard manpower overview: headcount, attendance, overtime hours and payroll cost for the current month.",
      },
      { property: "og:title", content: "Dashboard — Ocean Workforce" },
      {
        property: "og:description",
        content: "Live shipyard manpower overview: headcount, attendance, overtime and payroll cost.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="tabular mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Dashboard() {
  const { workers, attendance } = useDemoState();
  const month = recentMonths(1)[0]!;
  const inMonth = attendance.filter((a) => monthKey(a.date) === month);
  const otHours = round(inMonth.reduce((s, r) => s + r.otHours, 0));
  const normalHours = round(inMonth.reduce((s, r) => s + r.normalHours, 0));
  const cost = round(
    workers.reduce(
      (s, w) => s + calcPayroll(w, inMonth.filter((a) => a.workerId === w.id)).net,
      0,
    ),
  );

  const expiring = workers
    .map((w) => ({
      w,
      days: Math.ceil((new Date(w.passportExpiry).getTime() - Date.now()) / 86400000),
    }))
    .filter((x) => x.days < 120)
    .sort((a, b) => a.days - b.days);

  const topOt = workers
    .map((w) => ({
      w,
      ot: round(inMonth.filter((a) => a.workerId === w.id).reduce((s, r) => s + r.otHours, 0)),
    }))
    .sort((a, b) => b.ot - a.ot)
    .slice(0, 6);
  const maxOt = Math.max(1, ...topOt.map((t) => t.ot));

  const recent = [...inMonth].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const nameOf = (id: string) => workers.find((w) => w.id === id)?.name ?? "—";

  return (
    <AppShell title="Operations dashboard" subtitle={`Pay period: ${monthLabel(month)}`}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Active workers"
          value={String(workers.filter((w) => w.status === "Active").length)}
          hint={`${workers.length} deployed across 4 yards`}
          icon={Users}
        />
        <Stat label="Normal hours" value={normalHours.toFixed(0)} hint="Month to date" icon={Clock} />
        <Stat label="Overtime hours" value={otHours.toFixed(1)} hint="Auto-calculated from timesheets" icon={Timer} />
        <Stat label="Projected net payroll" value={money(cost)} hint="Recalculates with attendance" icon={ArrowUpRight} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Overtime leaders this month
          </h2>
          <div className="mt-4 space-y-3">
            {topOt.map(({ w, ot }) => (
              <div key={w.id} className="flex items-center gap-3">
                <Link
                  to="/workers/$id"
                  params={{ id: w.id }}
                  className="w-44 shrink-0 truncate text-sm font-medium hover:text-accent"
                >
                  {w.name}
                </Link>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="bg-accent-gradient h-full rounded-full" style={{ width: `${(ot / maxOt) * 100}%` }} />
                </div>
                <span className="tabular w-16 text-right text-sm text-muted-foreground">{ot.toFixed(1)} h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="size-4 text-warning" /> Document alerts
          </h2>
          <div className="mt-4 space-y-3">
            {expiring.length === 0 && <p className="text-sm text-muted-foreground">No documents expiring soon.</p>}
            {expiring.map(({ w, days }) => (
              <div key={w.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to="/workers/$id"
                    params={{ id: w.id }}
                    className="block truncate text-sm font-medium hover:text-accent"
                  >
                    {w.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">Passport {w.passportNo}</p>
                </div>
                <Badge variant={days < 60 ? "destructive" : "secondary"}>{days}d</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-surface mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Latest timesheets</h2>
          <Link to="/attendance" className="text-sm font-medium text-accent hover:underline">
            Open attendance
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-2.5 text-left font-medium">Date</th>
              <th className="px-5 py-2.5 text-left font-medium">Worker</th>
              <th className="px-5 py-2.5 text-left font-medium">In / Out</th>
              <th className="px-5 py-2.5 text-right font-medium">Normal</th>
              <th className="px-5 py-2.5 text-right font-medium">OT</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="tabular px-5 py-2.5">{r.date}</td>
                <td className="px-5 py-2.5">{nameOf(r.workerId)}</td>
                <td className="tabular px-5 py-2.5 text-muted-foreground">
                  {r.timeIn} – {r.timeOut}
                </td>
                <td className="tabular px-5 py-2.5 text-right">{r.normalHours.toFixed(2)}</td>
                <td className="tabular px-5 py-2.5 text-right font-medium text-accent">{r.otHours.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
