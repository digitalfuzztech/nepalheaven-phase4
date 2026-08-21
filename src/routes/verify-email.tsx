import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import {
  resendEmailVerificationFn,
  verifyEmailCodeFn,
} from "@/lib/email-verification.functions";
import { useAuth } from "@/lib/auth";
import { getPublicAuthenticationFn } from "@/lib/cms-page-content.functions";
import { getPublicSiteSettingsFn } from "@/lib/content.functions";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
    address: typeof search["address"] === "string" ? search["address"] : "",
    notice: typeof search["notice"] === "string" ? search["notice"] : "",
  }),
  loader: async () => {
    const [content, settings] = await Promise.all([
      getPublicAuthenticationFn(),
      getPublicSiteSettingsFn(),
    ]);
    return { content: content.verification, branding: settings.branding };
  },
  head: () => ({
    meta: [
      { title: "Verify email | Nepal Heaven" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { content, branding } = Route.useLoaderData();
  const { token, address, notice } = Route.useSearch();
  const { refresh } = useAuth();
  const [activeToken, setActiveToken] = useState(token);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(() =>
    notice ? content.successText : "",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEmail(
      window.sessionStorage.getItem("nepalheaven_verification_email") || "",
    );
  }, []);

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!activeToken && !email)
      return setError(
        "Open the verification link from your email or request a new one.",
      );
    setBusy(true);
    const result = await verifyEmailCodeFn({
      data: {
        ...(activeToken ? { token: activeToken } : {}),
        ...(!activeToken && email ? { email } : {}),
        code,
      },
    });
    setBusy(false);
    if (!result.ok) return setError(content.genericError);
    window.sessionStorage.removeItem("nepalheaven_verification_email");
    await refresh();
    window.location.assign("/account");
  }

  async function resend() {
    setBusy(true);
    setError("");
    const result = await resendEmailVerificationFn({
      data: {
        ...(activeToken ? { token: activeToken } : {}),
        ...(email ? { email } : {}),
      },
    });
    setBusy(false);
    setMessage(content.successText);
    setCode("");
    const next = new URL(
      result.verificationPath,
      window.location.origin,
    ).searchParams.get("token");
    if (next) setActiveToken(next);
  }

  return (
    <AuthShell
      eyebrow={content.leftSubtitle}
      title={content.leftTitle}
      description={content.leftDescription}
      branding={branding}
    >
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {content.rightTitle}
        </h2>
        {address ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Your verification code is being sent to: <strong>{address}</strong>
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-xl bg-forest/5 p-3 text-sm">{message}</p>
        ) : null}
        {activeToken || email ? (
          <form onSubmit={verify} className="mt-6 space-y-4">
            <input
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              placeholder={content.codePlaceholder}
              className="h-12 w-full rounded-2xl border border-border px-4 text-center text-xl tracking-[0.35em]"
            />
            <button
              disabled={busy}
              className="bg-gold-gradient h-12 w-full rounded-2xl font-bold text-gold-foreground disabled:opacity-60"
            >
              {busy ? "Verifying..." : content.submitText}
            </button>
          </form>
        ) : (
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Registration email"
            className="mt-6 h-12 w-full rounded-2xl border border-border px-4"
          />
        )}
        <button
          type="button"
          disabled={busy || (!activeToken && !email)}
          onClick={() => void resend()}
          className="mt-4 w-full text-sm font-bold text-primary disabled:opacity-50"
        >
          {content.resendText}
        </button>
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-bold text-primary">
            {content.linkText}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
