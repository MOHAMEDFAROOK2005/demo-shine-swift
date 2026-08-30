import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, Bell, ChevronDown, Clock, Timer, Users } from "lucide-react";
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

type StatAccent = "teal" | "blue" | "purple" | "amber";

const ACCENT_STYLES: Record<StatAccent, { icon: string; trend: string }> = {
  teal: { icon: "bg-stat-teal-muted text-stat-teal", trend: "bg-stat-teal-muted text-stat-teal" },
  blue: { icon: "bg-stat-blue-muted text-stat-blue", trend: "bg-stat-blue-muted text-stat-blue" },
  purple: { icon: "bg-stat-purple-muted text-stat-purple", trend: "bg-stat-purple-muted text-stat-purple" },
  amber: { icon: "bg-stat-amber-muted text-stat-amber", trend: "bg-stat-amber-muted text-stat-amber" },
};

function Stat({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  trend: string;
  icon: React.ElementType;
  accent: StatAccent;
}) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className="card-surface flex flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="tabular mt-3 text-2xl font-semibold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <span className={`mt-3 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${styles.trend}`}>
        {trend}
      </span>
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
    <AppShell
      title="Operations dashboard"
      subtitle={`Pay period: ${monthLabel(month)}`}
      actions={
        <>
          <button
            type="button"
            className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {expiring.length > 0 && (
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
            )}
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            {monthLabel(month)}
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Active workers"
          value={String(workers.filter((w) => w.status === "Active").length)}
          hint={`${workers.length} deployed across 4 yards`}
          trend="↑ 10% vs last month"
          icon={Users}
          accent="teal"
        />
        <Stat
          label="Normal hours"
          value={normalHours.toFixed(0)}
          hint="Month to date"
          trend="↑ 4% vs last month"
          icon={Clock}
          accent="blue"
        />
        <Stat
          label="Overtime hours"
          value={otHours.toFixed(1)}
          hint="Auto-calculated from timesheets"
          trend="↑ 12% vs last month"
          icon={Timer}
          accent="purple"
        />
        <Stat
          label="Projected net payroll"
          value={money(cost)}
          hint="Recalculates with attendance"
          trend="↑ 6% vs last month"
          icon={ArrowUpRight}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-4 sm:p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Overtime leaders this month
          </h2>
          <div className="mt-4 space-y-3">
            {topOt.map(({ w, ot }) => (
              <div key={w.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                <Link
                  to="/workers/$id"
                  params={{ id: w.id }}
                  className="truncate text-sm font-medium hover:text-accent sm:w-36 sm:shrink-0 lg:w-44"
                >
                  {w.name}
                </Link>
                <div className="flex flex-1 items-center gap-2 sm:gap-3">
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="bg-accent-gradient h-full rounded-full transition-all"
                      style={{ width: `${(ot / maxOt) * 100}%` }}
                    />
                  </div>
                  <span className="tabular shrink-0 text-right text-sm text-muted-foreground sm:w-16">
                    {ot.toFixed(1)} h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-4 sm:p-5">
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
                  <p className="truncate text-xs text-muted-foreground">Passport {w.passportNo}</p>
                </div>
                <Badge variant={days < 60 ? "destructive" : "secondary"} className="shrink-0">
                  {days}d
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-surface mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Latest timesheets</h2>
          <Link to="/attendance" className="text-sm font-medium text-accent hover:underline">
            Open attendance
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium sm:px-5">Date</th>
                <th className="px-4 py-2.5 text-left font-medium sm:px-5">Worker</th>
                <th className="px-4 py-2.5 text-left font-medium sm:px-5">In / Out</th>
                <th className="px-4 py-2.5 text-right font-medium sm:px-5">Normal</th>
                <th className="px-4 py-2.5 text-right font-medium sm:px-5">OT</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="tabular px-4 py-2.5 sm:px-5">{r.date}</td>
                  <td className="max-w-[120px] truncate px-4 py-2.5 sm:max-w-none sm:px-5">{nameOf(r.workerId)}</td>
                  <td className="tabular whitespace-nowrap px-4 py-2.5 text-muted-foreground sm:px-5">
                    {r.timeIn} – {r.timeOut}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right sm:px-5">{r.normalHours.toFixed(2)}</td>
                  <td className="tabular px-4 py-2.5 text-right font-medium text-accent sm:px-5">
                    {r.otHours.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
