// ---------------------------------------------------------------------------
// DEMO DATA (MVP)
// Fictional seed data for the client demonstration. In production this would be
// replaced by Supabase tables + RLS. All names/passports/companies are fictional.
// ---------------------------------------------------------------------------

export type Worker = {
  id: string;
  code: string;
  name: string;
  nationality: string;
  position: string;
  passportNo: string;
  passportExpiry: string; // ISO date
  shipyard: string;
  joinDate: string;
  status: "Active" | "On Leave" | "Demobilized";
  phone: string;
  basicMonthly: number; // SGD
  allowanceMonthly: number;
  otMultiplier: number;
  documents: { name: string; type: string; expiry?: string; status: "Valid" | "Expiring" | "Expired" }[];
};

export type Attendance = {
  id: string;
  workerId: string;
  date: string; // yyyy-MM-dd
  timeIn: string; // HH:mm
  timeOut: string; // HH:mm
  breakMinutes: number;
  totalHours: number;
  normalHours: number;
  otHours: number;
  remarks?: string;
};

export type Payslip = {
  id: string;
  workerId: string;
  month: string; // yyyy-MM
  reference: string;
  generatedAt: string;
  normalHours: number;
  otHours: number;
  daysWorked: number;
  basic: number;
  allowance: number;
  otPay: number;
  deductions: number;
  gross: number;
  net: number;
};

export type DemoState = {
  workers: Worker[];
  attendance: Attendance[];
  payslips: Payslip[];
};

const NATIONS = ["Indian", "Bangladeshi", "Filipino", "Myanmarese", "Malaysian", "Indonesian", "Sri Lankan"];
const POSITIONS = [
  "Structural Welder",
  "Marine Fitter",
  "Pipe Fitter",
  "Scaffolder",
  "Rigger",
  "Blaster / Painter",
  "Electrician",
  "QC Inspector",
  "Safety Coordinator",
  "Crane Operator",
];
const YARDS = ["Sembawang Yard A", "Tuas Marine Base", "Jurong Drydock 3", "Pandan Fabrication Bay"];

const NAMES = [
  "Rajesh Kumaran",
  "Md Shafiqul Islam",
  "Jomar Ramos Dela Cruz",
  "Aung Kyaw Moe",
  "Suresh Palanisamy",
  "Hasan Mahmud",
  "Ronnie Castillo",
  "Vignesh Murugan",
  "Zulkifli Bin Osman",
  "Agus Prasetyo",
  "Nuwan Perera",
  "Mizanur Rahman",
];

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0");
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function computeHours(timeIn: string, timeOut: string, breakMinutes: number) {
  const [ih, im] = timeIn.split(":").map(Number);
  const [oh, om] = timeOut.split(":").map(Number);
  let minutes = oh * 60 + om - (ih * 60 + im);
  if (minutes < 0) minutes += 24 * 60; // overnight shift
  minutes -= breakMinutes;
  const total = Math.max(0, Math.round((minutes / 60) * 100) / 100);
  const normal = Math.min(total, 8);
  const ot = Math.round((total - normal) * 100) / 100;
  return { totalHours: total, normalHours: Math.round(normal * 100) / 100, otHours: ot };
}

export function buildDemoState(): DemoState {
  const workers: Worker[] = NAMES.map((name, i) => {
    const basic = 1150 + (i % 5) * 130;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + [3, 26, 14, 1, 19, 31, 8, 22, 5, 29, 11, 16][i]);
    const passportExpiry = iso(expiry);
    const monthsToExpiry = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    const join = new Date();
    join.setFullYear(join.getFullYear() - (1 + (i % 4)));
    return {
      id: `w${i + 1}`,
      code: `OW-${pad(101 + i)}`,
      name,
      nationality: NATIONS[i % NATIONS.length],
      position: POSITIONS[i % POSITIONS.length],
      passportNo: `${["N", "BX", "P", "MM", "K", "A"][i % 6]}${pad(4820371 + i * 913, 7)}`,
      passportExpiry,
      shipyard: YARDS[i % YARDS.length],
      joinDate: iso(join),
      status: i === 9 ? "On Leave" : "Active",
      phone: `+65 8${pad(120 + i * 7, 3)} ${pad(4400 + i * 13, 4)}`,
      basicMonthly: basic,
      allowanceMonthly: 180 + (i % 3) * 60,
      otMultiplier: 1.5,
      documents: [
        {
          name: "Passport",
          type: "Identity",
          expiry: passportExpiry,
          status: monthsToExpiry < 3 ? "Expiring" : "Valid",
        },
        { name: "Work Permit", type: "Permit", expiry: passportExpiry, status: "Valid" },
        { name: "Safety Orientation (SOC)", type: "Certificate", status: "Valid" },
        {
          name: "Medical Fitness Report",
          type: "Medical",
          status: i % 6 === 0 ? "Expiring" : "Valid",
        },
      ],
    };
  });

  // Attendance: last 2 months, Mon-Sat
  const attendance: Attendance[] = [];
  const today = new Date();
  let seq = 1;
  for (let back = 0; back < 62; back++) {
    const d = new Date(today);
    d.setDate(d.getDate() - back);
    if (d.getDay() === 0) continue; // Sunday off
    for (const w of workers) {
      const n = Number(w.id.slice(1));
      if ((back + n) % 11 === 0) continue; // occasional absence
      if (w.status === "On Leave" && back < 6) continue;
      const otHrs = [0, 0, 1, 2, 2.5, 3, 0, 1.5][(back + n) % 8];
      const timeIn = "08:00";
      const outMinutes = 8 * 60 + 60 + otHrs * 60; // + 1h break
      const oh = Math.floor((8 * 60 + outMinutes) / 60);
      const om = Math.round(outMinutes % 60);
      const timeOut = `${pad(oh, 2)}:${pad(om, 2)}`;
      const calc = computeHours(timeIn, timeOut, 60);
      attendance.push({
        id: `a${seq++}`,
        workerId: w.id,
        date: iso(d),
        timeIn,
        timeOut,
        breakMinutes: 60,
        ...calc,
        remarks: otHrs >= 3 ? "Extended shift — hull block fit-up" : undefined,
      });
    }
  }

  return { workers, attendance, payslips: [] };
}
