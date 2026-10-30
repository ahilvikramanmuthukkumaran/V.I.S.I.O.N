import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge, OutcomeBadge } from "../components/StatusBadge";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { getInvoice } from "../services/invoiceService";
import { getVerification } from "../services/verificationService";
import { submitReview } from "../services/reviewService";
import { listAuditEvents } from "../services/auditService";
import type { Invoice } from "../types/invoice";
import type { VerificationResult } from "../types/verification";
import type { AuditEvent } from "../types/audit";

export function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [decision, setDecision] = useState<"APPROVE" | "REJECT" | "REQUEST_CORRECTION" | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [inv, ver, ev] = await Promise.all([getInvoice(id), getVerification(id), listAuditEvents()]);
      setInvoice(inv ?? null);
      setVerification(ver);
      setAudit(ev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invoice.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDecision() {
    if (!id || !decision) return;
    if ((decision === "REJECT" || decision === "REQUEST_CORRECTION") && !comment.trim()) {
      setActionError("Comment is required for this action.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const updated = await submitReview(id, { action: decision, comment: comment.trim() || undefined });
      if (updated) setInvoice(updated);
      else if (invoice) {
        // Mock fallback: mark resolved on approve.
        setInvoice({ ...invoice, status: decision === "APPROVE" ? "REVIEWED_RESOLVED" : invoice.status });
      }
      setDecision(null);
      setComment("");
      setConfirmOpen(false);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState label="Loading invoice..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!invoice) return <EmptyState title="Invoice not found" description="It may have been removed." />;

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">DETAIL</div>
          <h2>{invoice.invoiceNumber}</h2>
          <p>
            <StatusBadge status={invoice.status} />
          </p>
        </div>
        <Link to="/invoices" className="secondary-button">Back to queue</Link>
      </section>

      <section className="detail-grid">
        <div className="detail-card">
          <h3>Header fields</h3>
          <dl className="kv">
            <dt>Supplier</dt><dd>{invoice.supplierName}</dd>
            <dt>Invoice date</dt><dd>{invoice.invoiceDate}</dd>
            <dt>Currency</dt><dd>{invoice.currency}</dd>
            <dt>Total amount</dt><dd>{invoice.totalAmount != null ? invoice.totalAmount.toLocaleString() : "—"}</dd>
            <dt>PO reference</dt><dd>{invoice.poReference ?? "—"}</dd>
            <dt>GRN reference</dt><dd>{invoice.grnReference ?? "—"}</dd>
            <dt>Uploaded</dt><dd>{invoice.uploadedAt}</dd>
          </dl>
          {invoice.documentUrl ? (
            <a className="secondary-button" href={invoice.documentUrl} target="_blank" rel="noreferrer">
              Preview / download document
            </a>
          ) : (
            <p className="muted">Document preview not available (backend did not return a safe URL).</p>
          )}
        </div>

        <div className="detail-card">
          <h3>Line items</h3>
          {invoice.lines && invoice.lines.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>DESCRIPTION</th><th>QTY</th><th>UNIT PRICE</th><th>TAX</th><th>LINE TOTAL</th></tr>
                </thead>
                <tbody>
                  {invoice.lines.map((l, i) => (
                    <tr key={i}>
                      <td>{l.description}</td>
                      <td>{l.quantity ?? "—"}</td>
                      <td>{l.unitPrice != null ? l.unitPrice.toLocaleString() : "—"}</td>
                      <td>{l.tax != null ? l.tax.toLocaleString() : "—"}</td>
                      <td>{l.lineTotal != null ? l.lineTotal.toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No line items" description="Backend did not return line items." />
          )}
        </div>
      </section>

      <section className="detail-card">
        <h3>Extracted vs human-corrected values</h3>
        <p className="muted">AI extraction is a proposal. Original extracted values are preserved and never silently overwritten.</p>
        <div className="kv-grid">
          <div>
            <h4>Extracted (original)</h4>
            <pre className="code-block">{JSON.stringify(invoice.extracted ?? { note: "No extracted payload returned." }, null, 2)}</pre>
          </div>
          <div>
            <h4>Human-corrected</h4>
            <pre className="code-block">{JSON.stringify(invoice.corrected ?? { note: "No corrections recorded." }, null, 2)}</pre>
          </div>
        </div>
      </section>

      <section className="detail-card">
        <h3>Verification results</h3>
        {verification ? (
          <>
            <p>
              Overall: <OutcomeBadge outcome={verification.overall} />{" "}
              <span className="muted">({verification.extractedIsProposal ? "AI extraction is a proposal; backend rules decide." : ""})</span>
            </p>
            {verification.checks.length === 0 ? (
              <EmptyState title="No checks returned" />
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>CHECK</th><th>OUTCOME</th><th>REASON</th><th>EVIDENCE</th></tr>
                  </thead>
                  <tbody>
                    {verification.checks.map((c) => (
                      <tr key={c.code}>
                        <td>{c.name}</td>
                        <td><OutcomeBadge outcome={c.outcome} /></td>
                        <td>{c.reason}</td>
                        <td>{c.evidence?.join(", ") ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <EmptyState title="No verification data" />
        )}
      </section>

      <section className="detail-card">
        <h3>Reviewer actions</h3>
        <p className="muted">Approve means the next internal workflow step only. No payment execution.</p>
        <div className="action-row">
          <button type="button" className="primary-button" onClick={() => { setDecision("APPROVE"); setConfirmOpen(true); }} disabled={busy}>
            Approve
          </button>
          <button type="button" className="danger-button" onClick={() => { setDecision("REJECT"); setConfirmOpen(true); }} disabled={busy}>
            Reject
          </button>
          <button type="button" className="secondary-button" onClick={() => { setDecision("REQUEST_CORRECTION"); setConfirmOpen(true); }} disabled={busy}>
            Request correction
          </button>
        </div>
        <label className="field">
          <span>Comment {decision === "REJECT" || decision === "REQUEST_CORRECTION" ? "(required)" : "(optional)"}</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
        </label>
        {actionError ? <p className="error-text">{actionError}</p> : null}
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={`Confirm ${decision ?? ""}`}
        description="This action will be recorded in audit history."
        confirmLabel={decision === "APPROVE" ? "Approve" : decision === "REJECT" ? "Reject" : "Request correction"}
        onConfirm={handleDecision}
        onCancel={() => setConfirmOpen(false)}
        busy={busy}
      />

      <section className="detail-card">
        <h3>Audit history (this invoice)</h3>
        {audit.length === 0 ? (
          <EmptyState title="No audit events" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>ACTOR</th><th>ACTION</th><th>TIMESTAMP</th><th>OLD → NEW</th><th>REASON / COMMENT</th></tr>
              </thead>
              <tbody>
                {audit.map((e) => (
                  <tr key={e.id}>
                    <td>{e.actor}</td>
                    <td>{e.action}</td>
                    <td>{e.timestamp}</td>
                    <td>{e.oldStatus ?? "—"} → {e.newStatus ?? "—"}</td>
                    <td>{e.reason ?? e.comment ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
