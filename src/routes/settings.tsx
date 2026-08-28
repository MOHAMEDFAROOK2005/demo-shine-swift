import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { DEMO_USERS, resetDemoData, useDemoState } from "@/lib/demo-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Demo Tools — Ocean Workforce" },
      {
        name: "description",
        content:
          "Demo tools and payroll rules: reset demo data, review calculation rules and see what is MVP versus production scope.",
      },
      { property: "og:title", content: "Settings & Demo Tools — Ocean Workforce" },
      { property: "og:description", content: "Reset demo data, review payroll rules and MVP scope." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { workers, attendance, payslips } = useDemoState();

  return (
    <AppShell title="Settings & demo tools" subtitle="Configuration used by this demonstration build">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="font-display text-base font-semibold">Payroll rules (demo)</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Standard shift: 8 normal hours per day; anything beyond is overtime.</li>
            <li>Hourly rate = basic monthly ÷ 26 days ÷ 8 hours.</li>
            <li>Overtime rate = hourly rate × 1.5.</li>
            <li>Basic and allowance prorate on days worked (capped at 26 days).</li>
            <li>Deductions: 2% of gross + SGD 30 amenities.</li>
          </ul>
        </div>

        <div className="card-surface p-5">
          <h2 className="font-display text-base font-semibold">Demo credentials</h2>
          <div className="mt-3 space-y-2 text-sm">
            {Object.entries(DEMO_USERS).map(([role, u]) => (
              <div key={role} className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
                <span className="font-medium">{role}</span>
                <span className="tabular text-xs text-muted-foreground">
                  {u.email} / {u.password}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="font-display text-base font-semibold">Demo data</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {workers.length} workers · {attendance.length} attendance records · {payslips.length} payslips generated.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              resetDemoData();
              toast.success("Demo data restored to its original state");
            }}
          >
            <RotateCcw /> Reset demo data
          </Button>
        </div>

        <div className="card-surface p-5">
          <h2 className="font-display text-base font-semibold">MVP vs production</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Demo now: fictional login roles, browser-stored data, simplified payroll rules and demo documents.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Production later: real accounts and role-based access, hosted database with row-level security,
            multi-company support, document storage with expiry notifications and approved payroll rules.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
