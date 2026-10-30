import { request } from "./apiClient";
import { isApiConfigured } from "./apiClient";
import { mockSummary, mockFilterInvoices, mockInvoice } from "./mockData";
import type { Invoice, InvoiceSummary, InvoiceFilters } from "../types/invoice";

// Track whether sample data is in use so the UI can label it.
let usingMockData = !isApiConfigured();
export function isUsingMockData() {
  return usingMockData;
}

export async function getSummary(): Promise<InvoiceSummary> {
  if (!isApiConfigured()) {
    usingMockData = true;
    return mockSummary();
  }
  try {
    // TODO: replace path with actual backend route from Member 2.
    const data = await request<InvoiceSummary>("/invoices/summary");
    usingMockData = false;
    return data;
  } catch {
    usingMockData = true;
    return mockSummary();
  }
}

export async function listInvoices(filters: InvoiceFilters = {}): Promise<{ items: Invoice[]; total: number }> {
  if (!isApiConfigured()) {
    usingMockData = true;
    return mockFilterInvoices(filters);
  }
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
    if (filters.supplier) params.set("supplier", filters.supplier);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
    const qs = params.toString();
    const data = await request<{ items: Invoice[]; total: number }>(`/invoices${qs ? `?${qs}` : ""}`);
    usingMockData = false;
    return data;
  } catch {
    usingMockData = true;
    return mockFilterInvoices(filters);
  }
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  if (!isApiConfigured()) {
    usingMockData = true;
    return mockInvoice(id);
  }
  try {
    const data = await request<Invoice>(`/invoices/${encodeURIComponent(id)}`);
    usingMockData = false;
    return data;
  } catch {
    usingMockData = true;
    return mockInvoice(id);
  }
}
