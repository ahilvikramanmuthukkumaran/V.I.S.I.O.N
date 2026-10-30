import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Upload as UploadIcon, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { validateFile, uploadDocuments } from "../services/uploadService";

interface SelectedFile {
  file: File;
  error: string | null;
}

export function UploadPage() {
  const [invoice, setInvoice] = useState<SelectedFile | null>(null);
  const [po, setPo] = useState<SelectedFile | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const invoiceInput = useRef<HTMLInputElement>(null);
  const poInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!invoice && invoiceInput.current) invoiceInput.current.value = "";
  }, [invoice]);
  useEffect(() => {
    if (!po && poInput.current) poInput.current.value = "";
  }, [po]);

  function handleSelect(file: File, setter: (v: SelectedFile | null) => void) {
    setter({ file, error: validateFile(file) });
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice || invoice.error) return;
    if (po && po.error) return;
    setSubmitting(true);
    setProgress(0);
    setResult(null);
    try {
      const res = await uploadDocuments(invoice.file, po?.file ?? null, setProgress);
      setResult({ ok: true, message: res.message });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  function removeFile(setter: (v: SelectedFile | null) => void) {
    setter(null);
    setResult(null);
  }

  function renderFile(sf: SelectedFile | null, onRemove: () => void) {
    if (!sf) return <p className="muted">No file selected.</p>;
    return (
      <div className={`file-row ${sf.error ? "file-error" : ""}`}>
        <FileText size={18} />
        <div className="file-meta">
          <strong>{sf.file.name}</strong>
          <span>{(sf.file.size / 1024).toFixed(1)} KB · {sf.file.type || "unknown"}</span>
          {sf.error ? <em>{sf.error}</em> : null}
        </div>
        <button type="button" className="icon-button" onClick={onRemove} aria-label="Remove file">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <form className="upload-page" onSubmit={handleSubmit}>
      <section className="welcome-row">
        <div>
          <div className="eyebrow">UPLOAD</div>
          <h2>Upload documents</h2>
          <p>Select a supplier invoice and an optional purchase order. Backend performs authoritative validation.</p>
        </div>
      </section>

      <section className="upload-card">
        <h3>Supplier invoice (required)</h3>
        <input
          ref={invoiceInput}
          type="file"
          accept=".pdf,image/png,image/jpeg"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleSelect(f, setInvoice);
          }}
          hidden
        />
        <button type="button" className="secondary-button" onClick={() => invoiceInput.current?.click()}>
          <UploadIcon size={16} /> Choose invoice
        </button>
        {renderFile(invoice, () => removeFile(setInvoice))}

        <h3>Purchase order (optional)</h3>
        <input
          ref={poInput}
          type="file"
          accept=".pdf,image/png,image/jpeg"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleSelect(f, setPo);
          }}
          hidden
        />
        <button type="button" className="secondary-button" onClick={() => poInput.current?.click()}>
          <UploadIcon size={16} /> Choose PO
        </button>
        {renderFile(po, () => removeFile(setPo))}

        {progress !== null ? (
          <div className="progress-track">
            <div className="progress-fill blue-fill" style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        <div className="dialog-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={submitting || !invoice || !!invoice?.error || !!(po && po.error)}
          >
            {submitting ? "Uploading..." : "Submit documents"}
          </button>
        </div>

        {result ? (
          <div className={`state-box ${result.ok ? "success" : "error"}`} role="status">
            {result.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{result.message}</span>
            {result.ok ? <Link to="/invoices">View invoice queue</Link> : null}
          </div>
        ) : null}
      </section>
    </form>
  );
}
