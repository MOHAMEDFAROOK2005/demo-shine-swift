import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Anchor, Copy, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_USERS, getSession, hydrateStore, signIn, type DemoRole } from "@/lib/demo-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ocean Workforce — Shipyard Manpower & Payroll Demo" },
      {
        name: "description",
        content:
          "Demo login for Ocean Workforce: manage shipyard workers, attendance, overtime, payroll and PDF payslips in one system.",
      },
      { property: "og:title", content: "Ocean Workforce — Shipyard Manpower & Payroll Demo" },
      {
        property: "og:description",
        content: "Manage shipyard workers, attendance, overtime, payroll and PDF payslips in one system.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_USERS.Admin.email);
  const [password, setPassword] = useState(DEMO_USERS.Admin.password);
  const [error, setError] = useState("");

  useEffect(() => {
    hydrateStore();
    if (getSession()) void navigate({ to: "/dashboard" });
  }, [navigate]);

  function enter(mail: string, pass: string) {
    const session = signIn(mail, pass);
    if (!session) {
      setError("Invalid demo credentials. Use the demo details shown below.");
      return;
    }
    toast.success(`Signed in as ${session.role}`);
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-deep hidden flex-col justify-between p-12 text-deep-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="bg-accent-gradient flex size-10 items-center justify-center rounded-lg text-accent-foreground">
            <Anchor className="size-5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold">Ocean Workforce</p>
            <p className="text-xs text-deep-foreground/60">Marine & shipyard manpower suite</p>
          </div>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">
            Every worker, hour and payslip in one operational view.
          </h1>
          <p className="mt-4 max-w-md text-sm text-deep-foreground/70">
            Track deployment across yards, capture timesheets with automatic overtime calculation, and issue
            audit-ready PDF payslips in minutes.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
            {[
              ["12", "Workers deployed"],
              ["4", "Shipyards"],
              ["Auto", "OT calculation"],
            ].map(([v, k]) => (
              <div key={k} className="rounded-lg bg-surface-deep-soft/60 p-3">
                <p className="font-display text-xl font-semibold">{v}</p>
                <p className="text-[11px] text-deep-foreground/60">{k}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-deep-foreground/50">
          Demonstration build — all workers, passports and payroll figures are fictional.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">Sign in to the demo</h2>
          <p className="mt-1 text-sm text-muted-foreground">No account or verification needed.</p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              enter(email, password);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Enter demo
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-accent" /> Demo credentials
            </div>
            <div className="tabular mt-2 flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-2 text-xs">
              <div>
                <p>{DEMO_USERS.Admin.email}</p>
                <p className="text-muted-foreground">{DEMO_USERS.Admin.password}</p>
              </div>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `${DEMO_USERS.Admin.email} / ${DEMO_USERS.Admin.password}`,
                  );
                  toast.success("Credentials copied");
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy demo credentials"
              >
                <Copy className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Quick login</p>
            <div className="mt-2 grid gap-2">
              {(Object.keys(DEMO_USERS) as DemoRole[]).map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => enter(DEMO_USERS[role].email, DEMO_USERS[role].password)}
                >
                  Login as {role}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
