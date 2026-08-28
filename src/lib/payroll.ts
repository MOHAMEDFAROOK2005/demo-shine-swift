import type { Attendance, Payslip, Worker } from "./demo-data";

export const STANDARD_DAYS = 26;
export const STANDARD_HOURS = 8;

export function monthKey(date: string) {
  return date.slice(0, 7);
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y ?? 2026, (m ?? 1) - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function recentMonths(count = 6) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export function round(n: number) {
  return Math.round(n * 100) / 100;
}

export type PayrollLine = {
  worker: Worker;
  daysWorked: number;
  normalHours: number;
  otHours: number;
  hourlyRate: number;
  otHourlyRate: number;
  basic: number;
  allowance: number;
  otPay: number;
  deductions: number;
  gross: number;
  net: number;
};

/** Pure payroll calculation — the single source of truth for the demo. */
export function calcPayroll(worker: Worker, records: Attendance[]): PayrollLine {
  const daysWorked = records.length;
  const normalHours = round(records.reduce((s, r) => s + r.normalHours, 0));
  const otHours = round(records.reduce((s, r) => s + r.otHours, 0));
  const hourlyRate = round(worker.basicMonthly / STANDARD_DAYS / STANDARD_HOURS);
  const otHourlyRate = round(hourlyRate * worker.otMultiplier);
  const basic = round(Math.min(daysWorked, STANDARD_DAYS) * (worker.basicMonthly / STANDARD_DAYS));
  const allowance = round(
    (Math.min(daysWorked, STANDARD_DAYS) / STANDARD_DAYS) * worker.allowanceMonthly,
  );
  const otPay = round(otHours * otHourlyRate);
  const gross = round(basic + allowance + otPay);
  const deductions = daysWorked > 0 ? round(gross * 0.02 + 30) : 0; // levy share + amenities (demo rule)
  return {
    worker,
    daysWorked,
    normalHours,
    otHours,
    hourlyRate,
    otHourlyRate,
    basic,
    allowance,
    otPay,
    deductions,
    gross,
    net: round(gross - deductions),
  };
}

export function attendanceForMonth(attendance: Attendance[], workerId: string, month: string) {
  return attendance
    .filter((a) => a.workerId === workerId && monthKey(a.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function toPayslip(line: PayrollLine, month: string, id: string): Payslip {
  return {
    id,
    workerId: line.worker.id,
    month,
    reference: `PS-${month.replace("-", "")}-${line.worker.code}`,
    generatedAt: new Date().toISOString(),
    normalHours: line.normalHours,
    otHours: line.otHours,
    daysWorked: line.daysWorked,
    basic: line.basic,
    allowance: line.allowance,
    otPay: line.otPay,
    deductions: line.deductions,
    gross: line.gross,
    net: line.net,
  };
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD", minimumFractionDigits: 2 }).format(n);
