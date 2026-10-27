// Frontend types. These are aligned to the conceptual schema in the spec.
// Map to the real backend schema once Member 2 provides the contract.
// Do not invent backend field names; rename here if the API differs.

export type InvoiceStatus =
  | "MATCHED_PENDING_REVIEW"
  | "MISMATCH_FLAGGED"
  | "MISSING_INFORMATION"
  | "DUPLICATE_SUSPECTED"
  | "NEEDS_MANUAL_REVIEW"
  | "REVIEWED_RESOLVED";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "MATCHED_PENDING_REVIEW",
  "MISMATCH_FLAGGED",
  "MISSING_INFORMATION",
  "DUPLICATE_SUSPECTED",
  "NEEDS_MANUAL_REVIEW",
  "REVIEWED_RESOLVED",
];

export interface InvoiceLine {
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  tax: number | null;
  lineTotal: number | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  invoiceDate: string;
  currency: string;
  totalAmount: number | null;
  status: InvoiceStatus;
  uploadedAt: string;
  // Extracted vs corrected values. Original extracted values must never be overwritten silently.
  extracted?: Record<string, unknown>;
  corrected?: Record<string, unknown>;
  lines?: InvoiceLine[];
  documentUrl?: string;
  poReference?: string;
  grnReference?: string;
}

export interface InvoiceSummary {
  total: number;
  matched: number;
  mismatches: number;
  pendingReview: number;
}

export interface InvoiceFilters {
  status?: InvoiceStatus | "ALL";
  supplier?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
