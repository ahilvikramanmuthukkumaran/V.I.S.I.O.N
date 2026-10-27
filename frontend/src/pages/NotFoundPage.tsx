import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="state-box empty">
      <strong>Page not found</strong>
      <p>The requested page does not exist.</p>
      <Link to="/" className="secondary-button">Go to dashboard</Link>
    </div>
  );
}
