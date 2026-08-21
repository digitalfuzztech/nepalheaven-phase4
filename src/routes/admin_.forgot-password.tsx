import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { requestAdminPasswordResetFn } from "@/lib/auth.functions";
import { safeReturnPath } from "@/lib/safe-redirect";
import { getPublicAuthenticationFn } from "@/lib/cms-page-content.functions";
import { getPublicSiteSettingsFn } from "@/lib/content.functions";

export const Route = createFileRoute("/admin_/forgot-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: safeReturnPath(search["redirect"], "/admin/dashboard"),
  }),
  loader: async () => {
    const [content, settings] = await Promise.all([
      getPublicAuthenticationFn(),
      getPublicSiteSettingsFn(),
    ]);
    return {
      content: content.adminForgotPassword,
      branding: settings.branding,
    };
  },
  head: () => ({
    meta: [
      { title: "Admin password recovery | Nepal Heaven" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminForgotPasswordPage,
});

function AdminForgotPasswordPage() {
  const { content, branding } = Route.useLoaderData();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    await requestAdminPasswordResetFn({ data: { email, redirect } });
    setBusy(false);
    setSent(true);
  }
  return (
    <AuthShell
      admin
      eyebrow={content.leftSubtitle}
      title={content.leftTitle}
      description={content.leftDescription}
      branding={branding}
    >
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {content.rightTitle}
        </h2>
        {sent ? (
          <p className="mt-6 rounded-xl bg-forest/5 p-4 text-sm">
            {content.successText}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={content.emailPlaceholder}
              className="h-12 w-full rounded-2xl border border-border px-4"
            />
            <button
              disabled={busy}
              className="bg-gold-gradient h-12 w-full rounded-2xl font-bold text-gold-foreground disabled:opacity-60"
            >
              {busy ? "Sending…" : content.submitText}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm">
          <Link
            to="/admin"
            search={{ redirect }}
            className="font-bold text-primary"
          >
            {content.linkText}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
