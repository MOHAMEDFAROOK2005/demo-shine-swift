import { jsPDF } from "jspdf";
import type { Payslip, Worker } from "./demo-data";
import { money, monthLabel } from "./payroll";

export function buildPayslipPdf(worker: Worker, slip: Payslip) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const L = 48;

  // Header band
  doc.setFillColor(9, 34, 58);
  doc.rect(0, 0, W, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("OCEAN WORKFORCE", L, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Marine & Shipyard Manpower Management  |  DEMO DOCUMENT", L, 60);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PAYSLIP", W - L, 42, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(slip.reference, W - L, 60, { align: "right" });

  doc.setTextColor(30, 41, 59);
  let y = 128;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Pay period: ${monthLabel(slip.month)}`, L, y);
  y += 22;

  const rows: [string, string][] = [
    ["Worker", worker.name],
    ["Worker ID", worker.code],
    ["Position", worker.position],
    ["Nationality", worker.nationality],
    ["Shipyard / Client", worker.shipyard],
    ["Passport No.", worker.passportNo],
  ];
  doc.setFontSize(10);
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(k, L, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(String(v), L + 150, y);
    y += 17;
  });

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(L, y, W - L, y);
  y += 24;

  const table = (title: string, lines: [string, string][]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(9, 34, 58);
    doc.text(title, L, y);
    y += 16;
    doc.setFontSize(10);
    lines.forEach(([k, v]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(k, L, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(v, W - L, y, { align: "right" });
      y += 17;
    });
    y += 14;
  };

  table("Attendance summary", [
    ["Days worked", `${slip.daysWorked}`],
    ["Normal hours", `${slip.normalHours.toFixed(2)} hrs`],
    ["Overtime hours", `${slip.otHours.toFixed(2)} hrs`],
    ["Total hours", `${(slip.normalHours + slip.otHours).toFixed(2)} hrs`],
  ]);

  table("Earnings", [
    ["Basic pay", money(slip.basic)],
    ["Allowances", money(slip.allowance)],
    [`Overtime (x${worker.otMultiplier})`, money(slip.otPay)],
    ["Gross pay", money(slip.gross)],
  ]);

  table("Deductions", [["Levy share & amenities", money(slip.deductions)]]);

  doc.setFillColor(9, 34, 58);
  doc.roundedRect(L, y, W - L * 2, 46, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("NET PAY", L + 16, y + 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(money(slip.net), W - L - 16, y + 30, { align: "right" });

  y += 74;
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `Generated ${new Date(slip.generatedAt).toLocaleString("en-GB")} — fictional demo data for demonstration purposes only.`,
    L,
    y,
  );

  return doc;
}

export function downloadPayslipPdf(worker: Worker, slip: Payslip) {
  buildPayslipPdf(worker, slip).save(`${slip.reference}.pdf`);
}

export function payslipPdfDataUri(worker: Worker, slip: Payslip) {
  return buildPayslipPdf(worker, slip).output("datauristring");
}
