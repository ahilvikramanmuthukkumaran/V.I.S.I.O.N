import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Upload, ShieldCheck, History, Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoice Queue", icon: FileText },
  { to: "/upload", label: "Upload Documents", icon: Upload },
  { to: "/verification", label: "Verification", icon: ShieldCheck },
  { to: "/audit", label: "Audit History", icon: History },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div className={`sidebar-backdrop ${open ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1>V.I.S.I.O.N.</h1>
            <p>Intelligent Operations</p>
          </div>
          <button className="sidebar-close" type="button" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <ShieldCheck size={20} />
            <div>
              <strong>Secure workspace</strong>
              <p>Document review and verification</p>
            </div>
          </div>
          <div className="profile">
            <div className="avatar" aria-hidden="true">AP</div>
            <div className="profile-info">
              <strong>Reviewer</strong>
              <span>Workspace user</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// keep Menu import used? re-export for Topbar convenience
export { Menu };
