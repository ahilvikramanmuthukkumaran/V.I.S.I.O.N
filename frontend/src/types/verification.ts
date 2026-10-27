export type VerificationOutcome = "PASS" | "WARN" | "FAIL";

export interface VerificationCheck {
  code: string;
  name: string;
  outcome: VerificationOutcome;
  reason: string;
  evidence?: string[];
}

export interface VerificationResult {
  invoiceId: string;
  overall: VerificationOutcome;
  checks: VerificationCheck[];
  extractedIsProposal: boolean;
  generatedAt?: string;
}
