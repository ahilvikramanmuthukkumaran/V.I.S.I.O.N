import { useLocation } from "react-router-dom";
import { Search, Bell, Menu } from "lucide-react";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/invoices": "Invoice Queue",
  "/upload": "Upload Documents",
  "/verification": "Verification",
  "/audit": "Audit History",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const title = TITLES[location.pathname] ?? "V.I.S.I.O.N.";
  const isMock = false;

  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" type="button" aria-label="Open menu" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      <div className="breadcrumb">
        Workspace <span>/</span> <strong>{title}</strong>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input type="search" placeholder="Search invoices..." aria-label="Search invoices" />
        </label>

        <button className="icon-button notification-button" type="button" aria-label="Notifications">
          <Bell size={19} />
        </button>

        <div className="topbar-date">{new Date().toLocaleDateString()}</div>
      </div>

      {isMock ? null : null}
    </header>
  );
}
