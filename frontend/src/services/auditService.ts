import { request } from "./apiClient";
import { isApiConfigured } from "./apiClient";
import { MOCK_AUDIT } from "./mockData";
import type { AuditEvent } from "../types/audit";

export async function listAuditEvents(): Promise<AuditEvent[]> {
  if (!isApiConfigured()) {
    return MOCK_AUDIT;
  }
  try {
    return await request<AuditEvent[]>("/audit");
  } catch {
    return MOCK_AUDIT;
  }
}
