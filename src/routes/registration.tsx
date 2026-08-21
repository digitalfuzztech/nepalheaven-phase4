import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { countryOptions } from "@/lib/countries";
import { registerCustomerFn } from "@/lib/registration.functions";
import { getPublicAuthenticationFn } from "@/lib/cms-page-content.functions";
import { getPublicSiteSettingsFn } from "@/lib/content.functions";

export const Route = createFileRoute("/registration")({
  loader: async () => {
    const [content, settings] = await Promise.all([
      getPublicAuthenticationFn(),
      getPublicSiteSettingsFn(),
    ]);
    return {
      nationalities: countryOptions(),
      content: content.registration,
      branding: settings.branding,
    };
  },
  head: () => ({
    meta: [
      { title: "Create account | Nepal Heaven" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RegistrationPage,
});

function RegistrationPage() {
  const { nationalities, content, branding } = Route.useLoaderData();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    dateOfBirth: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (
      form.password.length < 8 ||
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[0-9]/.test(form.password)
    )
      return setError(content.passwordRequirementsError);
    if (form.password !== form.confirm)
      return setError(content.passwordMismatchError);
    setBusy(true);
    try {
      const result = await registerCustomerFn({
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality,
          dateOfBirth: form.dateOfBirth,
          password: form.password,
        },
      });
      if (!result.ok) return setError(content.genericError);
      window.sessionStorage.setItem(
        "nepalheaven_verification_email",
        form.email.trim().toLowerCase(),
      );
      const verificationUrl = new URL(
        result.verificationPath,
        window.location.origin,
      );
      const [local, domain] = form.email.trim().toLowerCase().split("@");
      verificationUrl.searchParams.set(
        "address",
        `${local?.slice(0, 2) || ""}***@${domain || ""}`,
      );
      verificationUrl.searchParams.set(
        "notice",
        result.existingPending
          ? result.sent
            ? "pending_registration_sent"
            : "pending_registration_cooldown"
          : result.sent
            ? "sent"
            : "send_failed",
      );
      window.location.assign(
        `${verificationUrl.pathname}${verificationUrl.search}`,
      );
    } catch (registrationError) {
      console.error(registrationError);
      setError(content.genericError);
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-gold";
  return (
    <AuthShell
      eyebrow={content.leftSubtitle}
      title={content.leftTitle}
      description={content.leftDescription}
      branding={branding}
    >
      <div>
        <p className="eyebrow text-gold">{content.rightSubtitle}</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-primary">
          {content.rightTitle}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {content.rightDescription}
        </p>
        {error ? (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}
        <form onSubmit={submit} className="mt-7 space-y-4">
          <input
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder={content.namePlaceholder}
            autoComplete="name"
            className={inputClass}
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder={content.emailPlaceholder}
            autoComplete="email"
            className={inputClass}
          />
          <input
            required
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder={content.phonePlaceholder}
            autoComplete="tel"
            className={inputClass}
          />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              {content.countryLabel} *
            </span>
            <select
              required
              value={form.nationality}
              onChange={(event) => update("nationality", event.target.value)}
              autoComplete="country-name"
              className={inputClass}
            >
              <option value="">Select nationality</option>
              {nationalities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              {content.birthDateLabel} *
            </span>
            <input
              required
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => update("dateOfBirth", event.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              autoComplete="bday"
              className={inputClass}
            />
          </label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder={content.passwordPlaceholder}
            autoComplete="new-password"
            className={inputClass}
          />
          <input
            required
            type="password"
            value={form.confirm}
            onChange={(event) => update("confirm", event.target.value)}
            placeholder={content.confirmPasswordPlaceholder}
            autoComplete="new-password"
            className={inputClass}
          />
          <button
            disabled={busy}
            className="bg-gold-gradient flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-gold-foreground disabled:opacity-60"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Creating account..." : content.submitText}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {content.bottomText}{" "}
          <Link to="/login" className="font-bold text-primary hover:text-gold">
            {content.secondaryLinkText}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
