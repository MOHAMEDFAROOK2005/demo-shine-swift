import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Anchor,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getSession, hydrateStore, signOut, type DemoSession } from "@/lib/demo-store";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workers", label: "Workers", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/payroll", label: "Payroll & Payslips", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <span className="bg-accent-gradient flex size-9 shrink-0 items-center justify-center rounded-lg text-accent-foreground">
        <Anchor className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display truncate text-sm font-semibold leading-tight">Ocean Workforce</p>
        <p className="truncate text-[11px] text-deep-foreground/60">Shipyard manpower suite</p>
      </div>
    </div>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-surface-deep-soft font-semibold text-deep-foreground"
                : "text-deep-foreground/70 hover:bg-surface-deep-soft/60"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SessionCard({
  session,
  onSignOut,
}: {
  session: DemoSession;
  onSignOut: () => void;
}) {
  return (
    <div className="rounded-lg bg-surface-deep-soft/70 p-3">
      <p className="truncate text-sm font-medium">{session.name}</p>
      <p className="mb-3 truncate text-[11px] text-deep-foreground/60">{session.role} · demo session</p>
      <button
        onClick={onSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-deep-foreground/20 px-2 py-1.5 text-xs transition-colors hover:bg-surface-deep-soft"
      >
        <LogOut className="size-3.5" /> Sign out
      </button>
    </div>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrateStore();
    const s = getSession();
    if (!s) void navigate({ to: "/" });
    else setSession(s);
  }, [navigate]);

  function handleSignOut() {
    signOut();
    void navigate({ to: "/" });
  }

  if (!session) return <div className="min-h-screen bg-background" />;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="bg-deep sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between px-4 py-6 text-deep-foreground lg:flex">
        <div>
          <div className="mb-8">
            <SidebarBrand />
          </div>
          <NavLinks pathname={pathname} />
        </div>
        <SessionCard session={session} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="bg-deep w-72 border-none p-0 text-deep-foreground">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <div className="flex h-full flex-col justify-between px-4 py-6">
            <div>
              <div className="mb-8 pr-8">
                <SidebarBrand />
              </div>
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <SessionCard session={session} onSignOut={handleSignOut} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3 px-4 py-3 sm:items-center sm:px-6 sm:py-4 lg:px-8">
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold sm:text-xl md:text-2xl">{title}</h1>
                {subtitle && <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
              </div>
            </div>
            {actions && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
            )}
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
