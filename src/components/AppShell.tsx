import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Anchor,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { getSession, hydrateStore, signOut, type DemoSession } from "@/lib/demo-store";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workers", label: "Workers", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/payroll", label: "Payroll & Payslips", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [session, setSession] = useState<DemoSession | null>(null);

  useEffect(() => {
    hydrateStore();
    const s = getSession();
    if (!s) void navigate({ to: "/" });
    else setSession(s);
  }, [navigate]);

  if (!session) return <div className="min-h-screen bg-background" />;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="bg-deep sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between px-4 py-6 text-deep-foreground md:flex">
        <div>
          <div className="mb-8 flex items-center gap-3 px-2">
            <span className="bg-accent-gradient flex size-9 items-center justify-center rounded-lg text-accent-foreground">
              <Anchor className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold leading-tight">Ocean Workforce</p>
              <p className="text-[11px] text-deep-foreground/60">Shipyard manpower suite</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-surface-deep-soft font-semibold text-deep-foreground"
                      : "text-deep-foreground/70 hover:bg-surface-deep-soft/60"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-lg bg-surface-deep-soft/70 p-3">
          <p className="text-sm font-medium">{session.name}</p>
          <p className="mb-3 text-[11px] text-deep-foreground/60">{session.role} · demo session</p>
          <button
            onClick={() => {
              signOut();
              void navigate({ to: "/" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-deep-foreground/20 px-2 py-1.5 text-xs transition-colors hover:bg-surface-deep-soft"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-border bg-card/85 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                activeProps={{ className: "bg-secondary font-semibold text-foreground" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
