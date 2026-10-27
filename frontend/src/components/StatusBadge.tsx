import type { InvoiceStatus } from "../types/invoice";
import type { VerificationOutcome } from "../types/verification";

const INVOICE_LABELS: Record<InvoiceStatus, string> = {
  MATCHED_PENDING_REVIEW: "Matched - pending review",
  MISMATCH_FLAGGED: "Mismatch flagged",
  MISSING_INFORMATION: "Missing information",
  DUPLICATE_SUSPECTED: "Duplicate suspected",
  NEEDS_MANUAL_REVIEW: "Needs manual review",
  REVIEWED_RESOLVED: "Reviewed / resolved",
};

const INVOICE_CLASS: Record<InvoiceStatus, string> = {
  MATCHED_PENDING_REVIEW: "status-matched",
  MISMATCH_FLAGGED: "status-mismatch",
  MISSING_INFORMATION: "status-missing",
  DUPLICATE_SUSPECTED: "status-duplicate",
  NEEDS_MANUAL_REVIEW: "status-manual",
  REVIEWED_RESOLVED: "status-resolved",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`status-badge ${INVOICE_CLASS[status]}`}>
      <span className="status-dot" aria-hidden="true" />
      {INVOICE_LABELS[status]}
    </span>
  );
}

export function OutcomeBadge({ outcome }: { outcome: VerificationOutcome }) {
  const cls = outcome === "PASS" ? "status-pass" : outcome === "WARN" ? "status-warn" : "status-fail";
  const label = outcome === "PASS" ? "PASS" : outcome === "WARN" ? "WARN" : "FAIL";
  return (
    <span className={`status-badge ${cls}`}>
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
