import { request } from "./apiClient";
import { isApiConfigured } from "./apiClient";
import type { Invoice } from "../types/invoice";

export interface ReviewDecision {
  action: "APPROVE" | "REJECT" | "REQUEST_CORRECTION";
  comment?: string;
}

export async function submitReview(invoiceId: string, decision: ReviewDecision): Promise<Invoice | undefined> {
  if (!isApiConfigured()) {
    // Mock: return updated invoice locally.
    return undefined;
  }
  return await request<Invoice>(`/invoices/${encodeURIComponent(invoiceId)}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decision),
  });
}
