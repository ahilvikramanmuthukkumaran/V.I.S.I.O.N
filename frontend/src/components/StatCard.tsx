interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "blue" | "green" | "red" | "amber";
}

export function StatCard({ label, value, hint, tone = "blue" }: StatCardProps) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {hint ? <div className="stat-foot"><span>{hint}</span></div> : null}
    </article>
  );
}
