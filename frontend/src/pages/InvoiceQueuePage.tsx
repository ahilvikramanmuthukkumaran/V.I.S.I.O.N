import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { listInvoices } from "../services/invoiceService";
import { INVOICE_STATUSES } from "../types/invoice";
import type { Invoice, InvoiceStatus } from "../types/invoice";

export function InvoiceQueuePage() {
  const [params, setParams] = useSearchParams();
  const statusParam = (params.get("status") as InvoiceStatus | "ALL" | null) ?? "ALL";
  const searchParam = params.get("q") ?? "";
  const pageParam = Number(params.get("page") ?? "1");

  const [status, setStatus] = useState<InvoiceStatus | "ALL">(statusParam);
  const [search, setSearch] = useState(searchParam);
  const [page, setPage] = useState(pageParam);

  const [items, setItems] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await listInvoices({ status, search, page, pageSize });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  function updateStatus(v: InvoiceStatus | "ALL") {
    setStatus(v);
    setPage(1);
    const next = new URLSearchParams(params);
    if (v === "ALL") next.delete("status"); else next.set("status", v);
    next.set("page", "1");
    setParams(next);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">QUEUE</div>
          <h2>Invoice queue</h2>
          <p>Server-backed list with filters. Open a record to review details and verification.</p>
        </div>
      </section>

      <section className="filter-bar">
        <form className="search-box" onSubmit={applySearch}>
          <Search size={17} />
          <input
            type="search"
            placeholder="Search invoice / supplier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search invoices"
          />
          <button type="submit" className="secondary-button">Search</button>
        </form>

        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value as InvoiceStatus | "ALL")}
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      {loading ? (
        <LoadingState label="Loading invoices..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="No invoices found" description="Adjust filters or upload documents." />
      ) : (
        <>
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
                {items.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div className="invoice-id">{inv.invoiceNumber}</div>
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
                      <Link className="row-action" to={`/invoices/${inv.id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              type="button"
              className="secondary-button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <button
              type="button"
              className="secondary-button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
