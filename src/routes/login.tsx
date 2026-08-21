import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/AuthShell";
import { AuthForm } from "@/components/AuthForm";
import { getPublicAuthenticationFn } from "@/lib/cms-page-content.functions";
import { getPublicSiteSettingsFn } from "@/lib/content.functions";

export const Route = createFileRoute("/login")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string; verified?: string } => ({
    ...(typeof search["redirect"] === "string"
      ? { redirect: search["redirect"] }
      : {}),
    ...(search["verified"] === "1" ? { verified: "1" } : {}),
  }),
  loader: async () => {
    const [content, settings] = await Promise.all([
      getPublicAuthenticationFn(),
      getPublicSiteSettingsFn(),
    ]);
    return { content: content.customerLogin, branding: settings.branding };
  },
  head: () => ({
    meta: [
      { title: "Sign in | Nepal Heaven" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect, verified } = Route.useSearch();
  const { content, branding } = Route.useLoaderData();
  return (
    <AuthShell
      eyebrow={content.leftSubtitle}
      title={content.leftTitle}
      description={content.leftDescription}
      branding={branding}
    >
      {verified ? (
        <p className="mb-4 rounded-xl bg-forest/10 p-3 text-sm">
          {content.successText}
        </p>
      ) : null}
      <AuthForm
        role="customer"
        title={content.rightTitle}
        subtitle={content.rightDescription}
        copy={content}
        {...(redirect ? { returnTo: redirect } : {})}
      />
    </AuthShell>
  );
}
