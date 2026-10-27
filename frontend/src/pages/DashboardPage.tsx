import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";
import { getSummary, listInvoices } from "../services/invoiceService";
import type { Invoice, InvoiceSummary } from "../types/invoice";

export function DashboardPage() {
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [recent, setRecent] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, list] = await Promise.all([getSummary(), listInvoices({ pageSize: 5 })]);
      setSummary(s);
      setRecent(list.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, list] = await Promise.all([getSummary(), listInvoices({ pageSize: 5 })]);
        if (!active) return;
        setSummary(s);
        setRecent(list.items);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!summary) return <EmptyState title="No data" description="No summary available." />;

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h2>Dashboard</h2>
          <p>Invoice verification workspace overview. AI extraction is a proposal; deterministic backend rules produce verification results.</p>
        </div>
        <Link to="/upload" className="primary-button">
          Upload documents
        </Link>
      </section>

      <section className="stats-grid" aria-label="Invoice statistics">
        <StatCard label="Total invoices" value={summary.total} hint="All records" tone="blue" />
        <StatCard label="Matched" value={summary.matched} hint="Matched / resolved" tone="green" />
        <StatCard label="Mismatches" value={summary.mismatches} hint="Requires attention" tone="red" />
        <StatCard label="Pending review" value={summary.pendingReview} hint="Awaiting human review" tone="amber" />
      </section>

      {summary.mismatches > 0 ? (
        <section className="attention-banner" role="alert">
          <div className="attention-copy">
            <strong>{summary.mismatches} invoices need your attention</strong>
            <p>Mismatches or missing information were detected. Review the flagged documents before proceeding.</p>
          </div>
          <Link to="/invoices?status=MISMATCH_FLAGGED" className="text-button">
            Review invoices
          </Link>
        </section>
      ) : null}

      <section className="invoice-panel">
        <div className="panel-header">
          <div>
            <h3>Recent invoices</h3>
            <p>Track documents and their verification progress.</p>
          </div>
          <Link to="/invoices" className="secondary-button">
            View all invoices
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState title="No invoices yet" description="Upload documents to get started." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>INVOICE</th>
                  <th>SUPPLIER</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div className="invoice-id">{inv.invoiceNumber}</div>
                      <div className="invoice-type">Supplier invoice</div>
                    </td>
                    <td className="supplier-name">{inv.supplierName}</td>
                    <td className="date-cell">{inv.invoiceDate}</td>
                    <td className="amount-cell">
                      {inv.totalAmount != null ? `${inv.currency} ${inv.totalAmount.toLocaleString()}` : "—"}
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td>
                      <Link className="row-action" to={`/invoices/${inv.id}`} aria-label={`View invoice ${inv.invoiceNumber}`}>
                        View
                      </Link>
                    </td>
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
