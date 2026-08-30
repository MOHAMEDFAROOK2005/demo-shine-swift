import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { newId, savePayslip, useDemoState } from "@/lib/demo-store";
import { downloadPayslipPdf } from "@/lib/payslip-pdf";
import {
  attendanceForMonth,
  calcPayroll,
  money,
  monthLabel,
  recentMonths,
  round,
  toPayslip,
  type PayrollLine,
} from "@/lib/payroll";

export const Route = createFileRoute("/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll & Payslips — Ocean Workforce" },
      {
        name: "description",
        content:
          "Recalculate monthly payroll from approved timesheets, preview payslips and download PDF payslips per worker.",
      },
      { property: "og:title", content: "Payroll & Payslips — Ocean Workforce" },
      {
        property: "og:description",
        content: "Recalculate payroll from timesheets, preview and download PDF payslips.",
      },
    ],
  }),
  component: PayrollPage,
});

function PayrollPage() {
  const { workers, attendance, payslips } = useDemoState();
  const months = recentMonths(6);
  const [month, setMonth] = useState(months[0]!);
  const [preview, setPreview] = useState<PayrollLine | null>(null);

  const lines = useMemo(
    () => workers.map((w) => calcPayroll(w, attendanceForMonth(attendance, w.id, month))),
    [workers, attendance, month],
  );

  const totals = {
    gross: round(lines.reduce((s, l) => s + l.gross, 0)),
    ot: round(lines.reduce((s, l) => s + l.otPay, 0)),
    net: round(lines.reduce((s, l) => s + l.net, 0)),
    otHours: round(lines.reduce((s, l) => s + l.otHours, 0)),
  };

  function generate(line: PayrollLine) {
    const slip = toPayslip(line, month, newId("p"));
    savePayslip(slip);
    setPreview(line);
    toast.success(`Payslip ${slip.reference} generated`);
  }

  function download(line: PayrollLine) {
    const slip = toPayslip(line, month, newId("p"));
    savePayslip(slip);
    downloadPayslipPdf(line.worker, slip);
    toast.success("PDF downloaded");
  }

  const generatedForMonth = payslips.filter((p) => p.month === month).length;

  return (
    <AppShell
      title="Payroll & payslips"
      subtitle={`${monthLabel(month)} · recalculated live from timesheets`}
      actions={
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Payroll month</Label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Gross payroll", money(totals.gross)],
          ["Overtime cost", money(totals.ot)],
          ["Net payable", money(totals.net)],
          ["Payslips generated", `${generatedForMonth} / ${workers.length}`],
        ].map(([k, v]) => (
          <div key={k} className="card-surface p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
            <p className="tabular mt-1 text-xl font-semibold">{v}</p>
          </div>
        ))}
      </div>

      <div className="card-surface mt-4 overflow-x-auto">
        <table className="w-full min-w-[940px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Worker</th>
              <th className="px-4 py-3 text-right font-medium">Days</th>
              <th className="px-4 py-3 text-right font-medium">Normal h</th>
              <th className="px-4 py-3 text-right font-medium">OT h</th>
              <th className="px-4 py-3 text-right font-medium">Basic</th>
              <th className="px-4 py-3 text-right font-medium">OT pay</th>
              <th className="px-4 py-3 text-right font-medium">Deductions</th>
              <th className="px-4 py-3 text-right font-medium">Net</th>
              <th className="px-4 py-3 text-right font-medium">Payslip</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.worker.id} className="border-t border-border hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{l.worker.name}</p>
                  <p className="tabular text-xs text-muted-foreground">
                    {l.worker.code} · {l.worker.position}
                  </p>
                </td>
                <td className="tabular px-4 py-3 text-right">{l.daysWorked}</td>
                <td className="tabular px-4 py-3 text-right">{l.normalHours.toFixed(2)}</td>
                <td className="tabular px-4 py-3 text-right text-accent">{l.otHours.toFixed(2)}</td>
                <td className="tabular px-4 py-3 text-right">{money(l.basic)}</td>
                <td className="tabular px-4 py-3 text-right">{money(l.otPay)}</td>
                <td className="tabular px-4 py-3 text-right text-muted-foreground">-{money(l.deductions)}</td>
                <td className="tabular px-4 py-3 text-right font-semibold">{money(l.net)}</td>
                <td className="px-4 py-3 text-right sm:px-5">
                  <div className="flex flex-col justify-end gap-1.5 sm:flex-row">
                    <Button size="sm" variant="outline" onClick={() => generate(l)}>
                      <FileText className="size-3.5" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                    <Button size="sm" onClick={() => download(l)}>
                      <Download className="size-3.5" />
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Payslip preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div>
              <div className="bg-deep flex items-center justify-between rounded-lg px-5 py-4 text-deep-foreground">
                <div>
                  <p className="font-display text-sm font-semibold">OCEAN WORKFORCE</p>
                  <p className="text-xs text-deep-foreground/70">{monthLabel(month)}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-medium">{preview.worker.name}</p>
                  <p className="text-deep-foreground/70">{preview.worker.code}</p>
                </div>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                {[
                  ["Days worked", String(preview.daysWorked)],
                  ["Normal hours", preview.normalHours.toFixed(2)],
                  ["Overtime hours", preview.otHours.toFixed(2)],
                  ["Basic pay", money(preview.basic)],
                  ["Allowance", money(preview.allowance)],
                  [`Overtime (x${preview.worker.otMultiplier})`, money(preview.otPay)],
                  ["Gross", money(preview.gross)],
                  ["Deductions", `- ${money(preview.deductions)}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-1.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="tabular font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
                <span className="text-sm font-medium">Net pay</span>
                <span className="tabular text-lg font-semibold">{money(preview.net)}</span>
              </div>
              <Button className="mt-4 w-full" onClick={() => download(preview)}>
                <Download /> Download PDF payslip
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
