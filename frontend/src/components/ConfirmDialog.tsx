import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;
  return (
    <dialog ref={ref} className="confirm-dialog" onClose={onCancel}>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      <div className="dialog-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button type="button" className="primary-button" onClick={onConfirm} disabled={busy}>
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
