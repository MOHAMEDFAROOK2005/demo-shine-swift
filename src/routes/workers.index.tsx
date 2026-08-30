import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newId, upsertWorker, useDemoState } from "@/lib/demo-store";
import type { Worker } from "@/lib/demo-data";

export const Route = createFileRoute("/workers/")({
  head: () => ({
    meta: [
      { title: "Workers — Ocean Workforce" },
      {
        name: "description",
        content: "Search and manage the shipyard workforce register: positions, nationalities, permits and yards.",
      },
      { property: "og:title", content: "Workers — Ocean Workforce" },
      { property: "og:description", content: "Search and manage the shipyard workforce register." },
    ],
  }),
  component: WorkersPage,
});

function WorkersPage() {
  const { workers } = useDemoState();
  const [q, setQ] = useState("");
  const [yard, setYard] = useState("All");
  const [open, setOpen] = useState(false);

  const yards = useMemo(() => ["All", ...new Set(workers.map((w) => w.shipyard))], [workers]);
  const rows = workers.filter((w) => {
    const hay = `${w.name} ${w.code} ${w.position} ${w.nationality} ${w.passportNo}`.toLowerCase();
    return hay.includes(q.toLowerCase()) && (yard === "All" || w.shipyard === yard);
  });

  function addWorker(form: HTMLFormElement) {
    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const worker: Worker = {
      id: newId("w"),
      code: get("code") || `OW-${Math.floor(Math.random() * 900 + 100)}`,
      name: get("name"),
      nationality: get("nationality"),
      position: get("position"),
      passportNo: get("passportNo"),
      passportExpiry: get("passportExpiry"),
      shipyard: get("shipyard"),
      joinDate: new Date().toISOString().slice(0, 10),
      status: "Active",
      phone: get("phone"),
      basicMonthly: Number(get("basicMonthly")) || 1200,
      allowanceMonthly: Number(get("allowanceMonthly")) || 180,
      otMultiplier: 1.5,
      documents: [
        { name: "Passport", type: "Identity", expiry: get("passportExpiry"), status: "Valid" },
        { name: "Work Permit", type: "Permit", status: "Valid" },
      ],
    };
    upsertWorker(worker);
    setOpen(false);
    toast.success(`${worker.name} added to the register`);
  }

  return (
    <AppShell
      title="Workforce register"
      subtitle={`${workers.length} workers on file`}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Add worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add worker</DialogTitle>
            </DialogHeader>
            <form
              id="add-worker"
              onSubmit={(e) => {
                e.preventDefault();
                addWorker(e.currentTarget);
              }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {[
                ["name", "Full name", "text", true],
                ["code", "Worker ID", "text", false],
                ["nationality", "Nationality", "text", true],
                ["position", "Position", "text", true],
                ["passportNo", "Passport no.", "text", true],
                ["passportExpiry", "Passport expiry", "date", true],
                ["shipyard", "Shipyard / client", "text", true],
                ["phone", "Phone", "text", false],
                ["basicMonthly", "Basic monthly (SGD)", "number", false],
                ["allowanceMonthly", "Allowance (SGD)", "number", false],
              ].map(([name, label, type, req]) => (
                <div key={String(name)} className="space-y-1.5">
                  <Label htmlFor={String(name)} className="text-xs">
                    {String(label)}
                  </Label>
                  <Input id={String(name)} name={String(name)} type={String(type)} required={Boolean(req)} />
                </div>
              ))}
            </form>
            <DialogFooter>
              <Button type="submit" form="add-worker">
                Save worker
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full min-w-0 sm:min-w-56 sm:flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, ID, position, passport…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {yards.map((y) => (
            <button
              key={y}
              onClick={() => setYard(y)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                yard === y
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Worker</th>
              <th className="px-5 py-3 text-left font-medium">Position</th>
              <th className="px-5 py-3 text-left font-medium">Nationality</th>
              <th className="px-5 py-3 text-left font-medium">Shipyard</th>
              <th className="px-5 py-3 text-left font-medium">Passport expiry</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.id} className="border-t border-border hover:bg-secondary/40">
                <td className="px-5 py-3">
                  <Link to="/workers/$id" params={{ id: w.id }} className="font-medium hover:text-accent">
                    {w.name}
                  </Link>
                  <p className="tabular text-xs text-muted-foreground">{w.code}</p>
                </td>
                <td className="px-5 py-3">{w.position}</td>
                <td className="px-5 py-3 text-muted-foreground">{w.nationality}</td>
                <td className="px-5 py-3 text-muted-foreground">{w.shipyard}</td>
                <td className="tabular px-5 py-3">{w.passportExpiry}</td>
                <td className="px-5 py-3">
                  <Badge variant={w.status === "Active" ? "secondary" : "outline"}>{w.status}</Badge>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  No workers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
