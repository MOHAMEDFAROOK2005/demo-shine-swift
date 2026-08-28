// ---------------------------------------------------------------------------
// DEMO STORE (MVP)
// Client-side persistence in localStorage so the demo runs anywhere, instantly.
// Swap this module for Supabase queries in production — the shape stays the same.
// ---------------------------------------------------------------------------
import { useSyncExternalStore } from "react";
import { buildDemoState, type Attendance, type DemoState, type Payslip, type Worker } from "./demo-data";

const KEY = "ocean-workforce-demo-v1";
const SESSION_KEY = "ocean-workforce-session-v1";

let state: DemoState = buildDemoState();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      state = JSON.parse(raw) as DemoState;
    } catch {
      state = buildDemoState();
      persist();
    }
  } else {
    persist();
  }
  emit();
}

function set(next: DemoState) {
  state = next;
  persist();
  emit();
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getState() {
  return state;
}

export function useDemoState() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function resetDemoData() {
  set(buildDemoState());
}

// --- Workers -------------------------------------------------------------
export function upsertWorker(worker: Worker) {
  const exists = state.workers.some((w) => w.id === worker.id);
  set({
    ...state,
    workers: exists ? state.workers.map((w) => (w.id === worker.id ? worker : w)) : [...state.workers, worker],
  });
}

export function deleteWorker(id: string) {
  set({
    ...state,
    workers: state.workers.filter((w) => w.id !== id),
    attendance: state.attendance.filter((a) => a.workerId !== id),
    payslips: state.payslips.filter((p) => p.workerId !== id),
  });
}

// --- Attendance ----------------------------------------------------------
export function saveAttendance(record: Attendance) {
  const exists = state.attendance.some((a) => a.id === record.id);
  set({
    ...state,
    attendance: exists
      ? state.attendance.map((a) => (a.id === record.id ? record : a))
      : [record, ...state.attendance],
  });
}

export function deleteAttendance(id: string) {
  set({ ...state, attendance: state.attendance.filter((a) => a.id !== id) });
}

// --- Payslips ------------------------------------------------------------
export function savePayslip(slip: Payslip) {
  const filtered = state.payslips.filter((p) => !(p.workerId === slip.workerId && p.month === slip.month));
  set({ ...state, payslips: [slip, ...filtered] });
}

export function newId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
}

// --- Demo session (NOT real auth — replace with Supabase auth later) -----
export type DemoRole = "Admin" | "Supervisor" | "Payroll Staff";
export type DemoSession = { email: string; name: string; role: DemoRole };

export const DEMO_USERS: Record<DemoRole, { email: string; password: string; name: string }> = {
  Admin: { email: "admin@oceanworkforce.demo", password: "Demo@12345", name: "A. Rahim (Admin)" },
  Supervisor: { email: "supervisor@oceanworkforce.demo", password: "Demo@12345", name: "K. Tan (Supervisor)" },
  "Payroll Staff": { email: "payroll@oceanworkforce.demo", password: "Demo@12345", name: "L. Fernandez (Payroll)" },
};

export function signIn(email: string, password: string): DemoSession | null {
  const entry = (Object.entries(DEMO_USERS) as [DemoRole, (typeof DEMO_USERS)["Admin"]][]).find(
    ([, u]) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!entry) return null;
  const session: DemoSession = { email: entry[1].email, name: entry[1].name, role: entry[0] };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function signOut() {
  window.localStorage.removeItem(SESSION_KEY);
}
