import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    AlertTriangle,
    Braces,
    Save,
} from "lucide-react";

import {
    useState,
    type FormEvent,
    type ReactNode,
} from "react";

import {
    AdminShell,
} from "@/components/admin/AdminShell";

import {
    getAdminSessionFn,
} from "@/lib/auth.functions";

import {
    getCmsEmailTemplateFn,
    updateCmsEmailTemplateFn,
} from "@/lib/cms-email-templates.functions";

import {
    emailTemplateUpdateSchema,
    type EmailTemplateUpdateInput,
} from "@/lib/cms-email-templates.schema";

export const Route =
    createFileRoute(
        "/admin_/cms_/email-templates_/$key",
    )({
        loader: async ({
                           params,
                       }) => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to: "/admin",
                    search: {
                        redirect:
                            `/admin/cms/email-templates/${params.key}`,
                    },
                });
            }

            const template =
                await getCmsEmailTemplateFn(
                    {
                        data: {
                            key:
                            params.key,
                        },
                    },
                );

            return {
                admin,
                template,
            };
        },

        component:
        EmailTemplateEditorPage,
    });

function EmailTemplateEditorPage() {
    const {
        template,
    } = Route.useLoaderData();

    const [form, setForm] =
        useState<EmailTemplateUpdateInput>(
            {
                key:
                template.key,

                subjectTemplate:
                template.subjectTemplate,

                htmlTemplate:
                template.htmlTemplate,

                textTemplate:
                template.textTemplate,

                status:
                template.status,
            },
        );

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    async function save(
        event: FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const parsed =
            emailTemplateUpdateSchema.safeParse(
                form,
            );

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]
                    ?.message ??
                "Check the template and try again.",
            );

            return;
        }

        /*
         * Inactive templates cannot be
         * sent by email.server.ts.
         */
        if (
            template.status ===
            "active" &&
            parsed.data.status ===
            "inactive"
        ) {
            const confirmed =
                window.confirm(
                    "Disabling this template will cause its email flow to fail until the template is reactivated. Continue?",
                );

            if (!confirmed) {
                return;
            }
        }

        setBusy(true);

        try {
            const updated =
                await updateCmsEmailTemplateFn(
                    {
                        data:
                        parsed.data,
                    },
                );

            setForm({
                key:
                updated.key,

                subjectTemplate:
                updated.subjectTemplate,

                htmlTemplate:
                updated.htmlTemplate,

                textTemplate:
                updated.textTemplate,

                status:
                updated.status,
            });

            setSuccess(
                "Email template saved successfully.",
            );
        } catch (saveError) {
            console.error(
                "Email template save failed",
                saveError,
            );

            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Email template could not be saved.",
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <AdminShell>
            <form
                onSubmit={save}
                className="p-5 lg:p-8"
            >
                <Link
                    to="/admin/cms/email-templates"
                    className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                >
                    ← Back to Email Templates
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                            Email Template
                        </p>

                        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                            {template.name}
                        </h1>

                        <code className="mt-2 block break-all text-sm text-muted-foreground">
                            {template.key}
                        </code>
                    </div>

                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />

                        {busy
                            ? "Saving..."
                            : "Save Template"}
                    </button>
                </div>

                {error ? (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                {success ? (
                    <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {success}
                    </div>
                ) : null}

                <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid gap-6">
                        <EditorSection
                            title="Template Configuration"
                            description="The key and system name are intentionally immutable."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <ReadOnlyField
                                    label="Template Name"
                                    value={
                                        template.name
                                    }
                                />

                                <ReadOnlyField
                                    label="Template Key"
                                    value={
                                        template.key
                                    }
                                />

                                <label className="grid gap-2 md:col-span-2">
                  <span className="text-sm font-semibold text-[#0c1724]">
                    Status
                  </span>

                                    <select
                                        value={
                                            form.status
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setForm(
                                                (
                                                    current,
                                                ) => ({
                                                    ...current,

                                                    status:
                                                        event
                                                            .target
                                                            .value as
                                                            | "active"
                                                            | "inactive",
                                                }),
                                            )
                                        }
                                        className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none focus:border-gold"
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </label>
                            </div>
                        </EditorSection>

                        <EditorSection
                            title="Subject"
                            description="Variables may be used with {{variableName}} syntax."
                        >
                            <input
                                value={
                                    form.subjectTemplate
                                }
                                onChange={(
                                    event,
                                ) =>
                                    setForm(
                                        (
                                            current,
                                        ) => ({
                                            ...current,

                                            subjectTemplate:
                                            event
                                                .target
                                                .value,
                                        }),
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none focus:border-gold"
                            />
                        </EditorSection>

                        <EditorSection
                            title="HTML Email Body"
                            description="HTML is wrapped inside Nepal Heaven's existing branded email shell when sent."
                        >
              <textarea
                  value={
                      form.htmlTemplate
                  }
                  rows={18}
                  spellCheck={false}
                  onChange={(
                      event,
                  ) =>
                      setForm(
                          (
                              current,
                          ) => ({
                              ...current,

                              htmlTemplate:
                              event
                                  .target
                                  .value,
                          }),
                      )
                  }
                  className="w-full resize-y rounded-xl border border-black/10 bg-[#0c1724] px-4 py-4 font-mono text-sm leading-relaxed text-white outline-none focus:border-gold"
              />
                        </EditorSection>

                        <EditorSection
                            title="Plain-text Body"
                            description="Used by text-only mail clients and as the plain-text alternative."
                        >
              <textarea
                  value={
                      form.textTemplate
                  }
                  rows={14}
                  spellCheck={false}
                  onChange={(
                      event,
                  ) =>
                      setForm(
                          (
                              current,
                          ) => ({
                              ...current,

                              textTemplate:
                              event
                                  .target
                                  .value,
                          }),
                      )
                  }
                  className="w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-4 font-mono text-sm leading-relaxed text-[#0c1724] outline-none focus:border-gold"
              />
                        </EditorSection>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={busy}
                                className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />

                                {busy
                                    ? "Saving..."
                                    : "Save Template"}
                            </button>
                        </div>
                    </div>

                    <aside className="space-y-5">
                        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Braces className="h-5 w-5 text-gold" />

                                <h2 className="font-semibold text-[#0c1724]">
                                    Allowed Variables
                                </h2>
                            </div>

                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Only these placeholders may
                                be used in this template.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {template
                                    .allowedVariables
                                    .length > 0 ? (
                                    template.allowedVariables.map(
                                        (
                                            variable,
                                        ) => (
                                            <code
                                                key={
                                                    variable
                                                }
                                                className="rounded-lg bg-black/5 px-2.5 py-1.5 text-xs text-[#0c1724]"
                                            >
                                                {
                                                    `{{${variable}}}`
                                                }
                                            </code>
                                        ),
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        This template has no
                                        variables.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <div className="flex gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

                                <div>
                                    <p className="text-sm font-semibold text-amber-950">
                                        Operational template
                                    </p>

                                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                                        Changes are used on the
                                        next email send. Setting
                                        this template inactive
                                        prevents the corresponding
                                        email from being sent.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </form>
        </AdminShell>
    );
}

function EditorSection({
                           title,
                           description,
                           children,
                       }: {
    title: string;
    description: string;
    children:
        ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="border-b border-black/10 pb-5">
                <h2 className="text-lg font-semibold text-[#0c1724]">
                    {title}
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>

            <div className="pt-6">
                {children}
            </div>
        </section>
    );
}

function ReadOnlyField({
                           label,
                           value,
                       }: {
    label: string;
    value: string;
}) {
    return (
        <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">
        {label}
      </span>

            <input
                value={value}
                readOnly
                className="h-11 rounded-xl border border-black/10 bg-black/[0.03] px-4 text-sm text-muted-foreground"
            />
        </label>
    );
}