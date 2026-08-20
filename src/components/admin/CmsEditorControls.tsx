import type { ButtonHTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

export function CmsEditorAlert({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  const isError = Boolean(error);
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm shadow-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      )}
      <div>
        <p className="font-semibold">{isError ? "Could not save" : "Saved"}</p>
        <p className="mt-0.5 leading-relaxed">{error || success}</p>
      </div>
    </div>
  );
}

export function CmsSaveButton({
  busy,
  label,
  floating = false,
  ...props
}: {
  busy: boolean;
  label: string;
  floating?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled">) {
  return (
    <button
      {...props}
      disabled={busy}
      className={
        floating
          ? "inline-flex items-center gap-2 rounded-xl bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-50"
          : "inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-50"
      }
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden />
      ) : (
        <Save className="h-4 w-4 text-gold" aria-hidden />
      )}
      {busy ? "Saving..." : label}
    </button>
  );
}

export function CmsFloatingSave({
  busy,
  label,
  onClick,
  type = "button",
}: {
  busy: boolean;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <div className="sticky bottom-4 z-30 mt-6 flex justify-end pointer-events-none">
      <div className="pointer-events-auto">
        <CmsSaveButton
          busy={busy}
          label={label}
          floating
          type={type}
          onClick={onClick}
        />
      </div>
    </div>
  );
}
