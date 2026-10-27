import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoiceQueuePage } from "./pages/InvoiceQueuePage";
import { UploadPage } from "./pages/UploadPage";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage";
import { VerificationPage } from "./pages/VerificationPage";
import { AuditHistoryPage } from "./pages/AuditHistoryPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/invoices" element={<InvoiceQueuePage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/audit" element={<AuditHistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
