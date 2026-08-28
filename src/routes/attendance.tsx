import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeHours } from "@/lib/demo-data";
import { deleteAttendance, newId, saveAttendance, useDemoState } from "@/lib/demo-store";
import { monthKey, monthLabel, recentMonths, round } from "@/lib/payroll";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance & Timesheets — Ocean Workforce" },
      {
        name: "description",
        content:
          "Capture time in and time out per worker; total, normal and overtime hours are calculated automatically and roll into monthly totals.",
      },
      { property: "og:title", content: "Attendance & Timesheets — Ocean Workforce" },
      {
        property: "og:description",
        content: "Capture time in/out; total, normal and overtime hours calculate automatically.",
      },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { workers, attendance } = useDemoState();
  const months = recentMonths(4);
  const [month, setMonth] = useState(months[0]!);
  const [workerId, setWorkerId] = useState("all");

  const [form, setForm] = useState({
    workerId: workers[0]?.id ?? "",
    date: new Date().toISOString().slice(0, 10),
    timeIn: "08:00",
    timeOut: "18:00",
    breakMinutes: 60,
    remarks: "",
  });

  const preview = computeHours(form.timeIn, form.timeOut, Number(form.breakMinutes) || 0);

  const rows = useMemo(
    () =>
      attendance
        .filter((a) => monthKey(a.date) === month && (workerId === "all" || a.workerId === workerId))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, month, workerId],
  );

  const totals = {
    days: rows.length,
    total: round(rows.reduce((s, r) => s + r.totalHours, 0)),
    normal: round(rows.reduce((s, r) => s + r.normalHours, 0)),
    ot: round(rows.reduce((s, r) => s + r.otHours, 0)),
  };

  const nameOf = (id: string) => workers.find((w) => w.id === id)?.name ?? "—";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.workerId) return;
    const calc = computeHours(form.timeIn, form.timeOut, Number(form.breakMinutes) || 0);
    saveAttendance({
      id: newId("a"),
      workerId: form.workerId,
      date: form.date,
      timeIn: form.timeIn,
      timeOut: form.timeOut,
      breakMinutes: Number(form.breakMinutes) || 0,
      ...calc,
      ...(form.remarks ? { remarks: form.remarks } : {}),
    });
    setMonth(monthKey(form.date));
    toast.success(
      `Saved — ${calc.totalHours.toFixed(2)} h total (${calc.normalHours.toFixed(2)} normal + ${calc.otHours.toFixed(2)} OT)`,
    );
    setForm({ ...form, remarks: "" });
  }

  const select =
    "h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <AppShell title="Attendance & timesheets" subtitle="Hours, normal time and overtime calculate automatically">
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="card-surface h-fit space-y-4 p-5">
          <h2 className="font-display text-base font-semibold">Add attendance</h2>
          <div className="space-y-1.5">
            <Label className="text-xs">Worker</Label>
            <select
              className={select}
              value={form.workerId}
              onChange={(e) => setForm({ ...form, workerId: e.target.value })}
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Break (mins)</Label>
              <Input
                type="number"
                min={0}
                value={form.breakMinutes}
                onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Time in</Label>
              <Input type="time" value={form.timeIn} onChange={(e) => setForm({ ...form, timeIn: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Time out</Label>
              <Input type="time" value={form.timeOut} onChange={(e) => setForm({ ...form, timeOut: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Remarks</Label>
            <Input
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Optional note"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary p-3 text-center">
            {[
              ["Total", preview.totalHours],
              ["Normal", preview.normalHours],
              ["OT", preview.otHours],
            ].map(([k, v]) => (
              <div key={String(k)}>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{String(k)}</p>
                <p className="tabular text-lg font-semibold">{Number(v).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Save attendance
          </Button>
        </form>

        <div className="space-y-4">
          <div className="card-surface flex flex-wrap items-end gap-3 p-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Month</Label>
              <select className={select} value={month} onChange={(e) => setMonth(e.target.value)}>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-48 flex-1 space-y-1.5">
              <Label className="text-xs">Worker filter</Label>
              <select className={select} value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
                <option value="all">All workers</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Entries", String(totals.days)],
              ["Total hours", totals.total.toFixed(2)],
              ["Normal hours", totals.normal.toFixed(2)],
              ["OT hours", totals.ot.toFixed(2)],
            ].map(([k, v]) => (
              <div key={k} className="card-surface p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
                <p className="tabular mt-1 text-xl font-semibold">{v}</p>
              </div>
            ))}
          </div>

          <div className="card-surface overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-left font-medium">Worker</th>
                  <th className="px-4 py-2.5 text-left font-medium">In</th>
                  <th className="px-4 py-2.5 text-left font-medium">Out</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-right font-medium">Normal</th>
                  <th className="px-4 py-2.5 text-right font-medium">OT</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 60).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="tabular px-4 py-2.5">{r.date}</td>
                    <td className="px-4 py-2.5">{nameOf(r.workerId)}</td>
                    <td className="tabular px-4 py-2.5">{r.timeIn}</td>
                    <td className="tabular px-4 py-2.5">{r.timeOut}</td>
                    <td className="tabular px-4 py-2.5 text-right">{r.totalHours.toFixed(2)}</td>
                    <td className="tabular px-4 py-2.5 text-right">{r.normalHours.toFixed(2)}</td>
                    <td className="tabular px-4 py-2.5 text-right font-medium text-accent">{r.otHours.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => {
                          deleteAttendance(r.id);
                          toast.success("Entry removed");
                        }}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                      No attendance for this selection yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
