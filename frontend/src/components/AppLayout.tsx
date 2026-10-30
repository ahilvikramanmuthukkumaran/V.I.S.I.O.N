import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { isUsingMockData } from "../services/invoiceService";
import { isApiConfigured } from "../services/apiClient";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mock = isUsingMockData() || !isApiConfigured();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        {mock ? (
          <div className="demo-banner" role="status">
            DEMO / SAMPLE DATA — backend not connected. Values shown are illustrative only.
          </div>
        ) : null}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
