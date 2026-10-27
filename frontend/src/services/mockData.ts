// DEMO/SAMPLE data used only when the backend is not configured or unreachable.
// Clearly labelled as sample. Replace with live API calls when routes are ready.
// Never present these totals as production figures.

import type { Invoice, InvoiceSummary, InvoiceFilters } from "../types/invoice";
import type { VerificationResult, VerificationCheck } from "../types/verification";
import type { AuditEvent } from "../types/audit";
import { INVOICE_STATUSES } from "../types/invoice";

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-001",
    supplierName: "Acme Technologies",
    invoiceDate: "2026-10-28",
    currency: "INR",
    totalAmount: 1125000,
    status: "MATCHED_PENDING_REVIEW",
    uploadedAt: "2026-10-28T09:12:00Z",
    poReference: "PO-4412",
    lines: [
      { description: "Cloud hosting (annual)", quantity: 1, unitPrice: 900000, tax: 162000, lineTotal: 1062000 },
      { description: "Support plan", quantity: 1, unitPrice: 50000, tax: 9000, lineTotal: 59000 },
    ],
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2026-002",
    supplierName: "Global Office Supplies",
    invoiceDate: "2026-10-27",
    currency: "INR",
    totalAmount: 148500,
    status: "MISMATCH_FLAGGED",
    uploadedAt: "2026-10-27T14:03:00Z",
    poReference: "PO-4390",
    lines: [
      { description: "Paper (A4, 50 reams)", quantity: 50, unitPrice: 450, tax: 4050, lineTotal: 22950 },
    ],
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2026-003",
    supplierName: "Vertex Solutions",
    invoiceDate: "2026-10-27",
    currency: "INR",
    totalAmount: 186200,
    status: "MISSING_INFORMATION",
    uploadedAt: "2026-10-27T11:20:00Z",
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2026-004",
    supplierName: "BluePeak Systems",
    invoiceDate: "2026-10-26",
    currency: "INR",
    totalAmount: 132750,
    status: "REVIEWED_RESOLVED",
    uploadedAt: "2026-10-26T08:45:00Z",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2026-005",
    supplierName: "Nova Industrial",
    invoiceDate: "2026-10-25",
    currency: "INR",
    totalAmount: 167400,
    status: "DUPLICATE_SUSPECTED",
    uploadedAt: "2026-10-25T16:30:00Z",
  },
  {
    id: "inv-006",
    invoiceNumber: "INV-2026-006",
    supplierName: "Acme Technologies",
    invoiceDate: "2026-10-24",
    currency: "INR",
    totalAmount: 98000,
    status: "NEEDS_MANUAL_REVIEW",
    uploadedAt: "2026-10-24T10:00:00Z",
  },
];

export function mockSummary(): InvoiceSummary {
  const total = MOCK_INVOICES.length;
  const matched = MOCK_INVOICES.filter((i) => i.status === "MATCHED_PENDING_REVIEW" || i.status === "REVIEWED_RESOLVED").length;
  const mismatches = MOCK_INVOICES.filter((i) => i.status === "MISMATCH_FLAGGED" || i.status === "DUPLICATE_SUSPECTED").length;
  const pendingReview = MOCK_INVOICES.filter((i) => i.status === "MATCHED_PENDING_REVIEW" || i.status === "NEEDS_MANUAL_REVIEW").length;
  return { total, matched, mismatches, pendingReview };
}

export function mockFilterInvoices(filters: InvoiceFilters = {}): { items: Invoice[]; total: number } {
  let items = [...MOCK_INVOICES];
  if (filters.status && filters.status !== "ALL") {
    items = items.filter((i) => i.status === filters.status);
  }
  if (filters.supplier) {
    const q = filters.supplier.toLowerCase();
    items = items.filter((i) => i.supplierName.toLowerCase().includes(q));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (i) => i.invoiceNumber.toLowerCase().includes(q) || i.supplierName.toLowerCase().includes(q),
    );
  }
  const total = items.length;
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  items = items.slice(start, start + pageSize);
  return { items, total };
}

export function mockInvoice(id: string): Invoice | undefined {
  return MOCK_INVOICES.find((i) => i.id === id);
}

export function mockVerification(invoiceId: string): VerificationResult {
  const checks: VerificationCheck[] = [
    {
      code: "ARITHMETIC",
      name: "Arithmetic check",
      outcome: "PASS",
      reason: "Line items sum to the invoice total.",
      evidence: ["INV-2026-001 total 1,125,000"],
    },
    {
      code: "SUPPLIER_REFERENCE",
      name: "Supplier / PO reference",
      outcome: "WARN",
      reason: "PO reference format differs from expected pattern (sample).",
      evidence: ["PO-4412"],
    },
    {
      code: "QUANTITY_PRICE",
      name: "Quantity and unit price vs PO",
      outcome: "FAIL",
      reason: "Unit price for line 2 exceeds PO unit price by 12%.",
      evidence: ["Line 2 unit price 50,000 vs PO 44,643"],
    },
  ];
  const overall: VerificationResult["overall"] =
    checks.some((c) => c.outcome === "FAIL") ? "FAIL" : checks.some((c) => c.outcome === "WARN") ? "WARN" : "PASS";
  return {
    invoiceId,
    overall,
    checks,
    extractedIsProposal: true,
    generatedAt: new Date().toISOString(),
  };
}

export const MOCK_AUDIT: AuditEvent[] = [
  {
    id: "ae-001",
    actor: "reviewer@vision.local",
    action: "STATUS_CHANGED",
    timestamp: "2026-10-28T10:00:00Z",
    oldStatus: "MATCHED_PENDING_REVIEW",
    newStatus: "REVIEWED_RESOLVED",
    reason: "Approved for next internal step",
    comment: "All checks acceptable.",
  },
  {
    id: "ae-002",
    actor: "system",
    action: "VERIFICATION_COMPLETED",
    timestamp: "2026-10-28T09:15:00Z",
    oldStatus: "MISSING_INFORMATION",
    newStatus: "MISMATCH_FLAGGED",
    reason: "Deterministic rule: quantity mismatch",
  },
];

// Keep INVOICE_STATUSES referenced to avoid unused import lint in some setups.
export const _invoiceStatuses = INVOICE_STATUSES;
