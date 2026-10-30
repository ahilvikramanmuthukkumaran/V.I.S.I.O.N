import { request } from "./apiClient";
import { isApiConfigured } from "./apiClient";
import { mockVerification } from "./mockData";
import type { VerificationResult } from "../types/verification";

export async function getVerification(invoiceId: string): Promise<VerificationResult> {
  if (!isApiConfigured()) {
    return mockVerification(invoiceId);
  }
  try {
    return await request<VerificationResult>(`/invoices/${encodeURIComponent(invoiceId)}/verification`);
  } catch {
    return mockVerification(invoiceId);
  }
}
