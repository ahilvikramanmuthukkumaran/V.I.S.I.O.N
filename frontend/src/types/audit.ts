export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  oldStatus?: string;
  newStatus?: string;
  reason?: string;
  comment?: string;
}
