import { useEffect, useState } from "react";
import { LoadingState } from "../components/LoadingState";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { listAuditEvents } from "../services/auditService";
import type { AuditEvent } from "../types/audit";

export function AuditHistoryPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setEvents(await listAuditEvents());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">AUDIT</div>
          <h2>Audit history</h2>
          <p>Actual backend events only. No fabricated entries.</p>
        </div>
      </section>

      {loading ? (
        <LoadingState label="Loading audit history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : events.length === 0 ? (
        <EmptyState title="No audit events" description="Events appear after reviewer actions." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>ACTOR</th><th>ACTION</th><th>TIMESTAMP</th><th>OLD → NEW</th><th>REASON / COMMENT</th></tr>
            </thead>
            <tbody>
              {events.map((e) => (
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
    </>
  );
}
