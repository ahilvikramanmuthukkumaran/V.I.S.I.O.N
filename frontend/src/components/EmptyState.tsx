interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="state-box empty">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
