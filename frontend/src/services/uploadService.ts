import { requestMultipart, isApiConfigured } from "./apiClient";

export interface UploadResult {
  invoiceId?: string;
  message: string;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB (usability only; backend is authoritative)
const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

export function validateFile(file: File): string | null {
  if (!ALLOWED.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
    return `${file.name}: unsupported file type. Use PDF/PNG/JPEG.`;
  }
  if (file.size > MAX_SIZE) {
    return `${file.name}: file too large (max 10 MB).`;
  }
  return null;
}

export async function uploadDocuments(invoiceFile: File, poFile: File | null, onProgress?: (pct: number) => void): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("invoice", invoiceFile);
  if (poFile) formData.append("po", poFile);

  if (!isApiConfigured()) {
    // Simulated progress for demo.
    for (let p = 0; p <= 100; p += 20) {
      onProgress?.(p);
      await new Promise((r) => setTimeout(r, 120));
    }
    return { message: "DEMO: upload simulated. Backend not connected." };
  }

  onProgress?.(10);
  // TODO: replace path/field names with actual backend contract.
  const result = await requestMultipart<UploadResult>("/uploads", formData);
  onProgress?.(100);
  return result;
}
