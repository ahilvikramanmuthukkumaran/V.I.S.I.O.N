import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OutcomeBadge } from "../components/StatusBadge";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { listInvoices } from "../services/invoiceService";
import { getVerification } from "../services/verificationService";
import type { Invoice } from "../types/invoice";
import type { VerificationResult } from "../types/verification";

export function VerificationPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await listInvoices({ pageSize: 50 });
        setInvoices(res.items);
        if (res.items.length) setSelected(res.items[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    getVerification(selected).then(setResult).catch(() => setResult(null));
  }, [selected]);

  if (loading) return <LoadingState label="Loading verification..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">VERIFICATION</div>
          <h2>Verification results</h2>
          <p>AI extraction is a proposal; deterministic backend rules produce PASS/WARN/FAIL. WARN/FAIL are never shown as approved.</p>
        </div>
      </section>

      <section className="detail-card">
        <label className="field">
          <span>Select invoice</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {invoices.map((i) => (
              <option key={i.id} value={i.id}>{i.invoiceNumber} — {i.supplierName}</option>
            ))}
          </select>
        </label>
        <Link to={selected ? `/invoices/${selected}` : "/invoices"} className="secondary-button">Open invoice detail</Link>
      </section>

      {result ? (
        <section className="detail-card">
          <p>Overall: <OutcomeBadge outcome={result.overall} /></p>
          {result.checks.length === 0 ? (
            <EmptyState title="No checks returned" />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>CHECK</th><th>OUTCOME</th><th>REASON</th><th>EVIDENCE</th></tr>
                </thead>
                <tbody>
                  {result.checks.map((c) => (
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
        </section>
      ) : (
        <EmptyState title="No verification data" />
      )}
    </>
  );
}
