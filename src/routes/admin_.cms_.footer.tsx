import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    FileText,
    Image,
    Navigation,
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
    getCmsFooterSettingsFn,
    updateCmsFooterSettingsFn,
} from "@/lib/cms-footer.functions";

import {
    getCmsNavigationMenusFn,
} from "@/lib/cms-navigation.functions";

import {
    cmsFooterSettingsInputSchema,
    type CmsFooterSettingsInput,
} from "@/lib/cms-footer.schema";

import {
    CmsMediaPicker,
} from "@/components/admin/CmsMediaPicker";

import {
    getCmsSelectableImagesFn,
} from "@/lib/cms-media.functions";

export const Route =
    createFileRoute(
        "/admin_/cms_/footer",
    )({
        loader: async () => {
            const admin =
                await getAdminSessionFn();

            if (!admin) {
                throw redirect({
                    to: "/admin",

                    search: {
                        redirect:
                            "/admin/cms/footer",
                    },
                });
            }

            const [
                settings,
                menus,
                images,
            ] = await Promise.all([
                getCmsFooterSettingsFn(),
                getCmsNavigationMenusFn(),
                getCmsSelectableImagesFn(),
            ]);

            return {
                admin,

                settings,

                images,

                footerMenus:
                    menus.filter(
                        (menu) =>
                            menu.key.startsWith(
                                "footer_",
                            ),
                    ),
            };
        },

        component:
        FooterSettingsPage,
    });

function FooterSettingsPage() {
    const {
        settings,
        footerMenus,
        images,
    } = Route.useLoaderData();

    const [form, setForm] =
        useState<CmsFooterSettingsInput>(
            {
                companyDescription:
                settings.companyDescription,

                journalDescription:
                settings.journalDescription,

                logoMediaId:
                settings.logoMediaId,
            },
        );

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    function updateField(
        field:
        Exclude<
            keyof CmsFooterSettingsInput,
            "logoMediaId"
        >,

        value: string,
    ) {
        setForm(
            (current) => ({
                ...current,

                [field]:
                value,
            }),
        );
    }

    async function save(
        event: FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const parsed =
            cmsFooterSettingsInputSchema.safeParse(
                form,
            );

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]
                    ?.message ??
                "Check the Footer Settings and try again.",
            );

            return;
        }

        setBusy(true);

        try {
            const updated =
                await updateCmsFooterSettingsFn(
                    {
                        data:
                        parsed.data,
                    },
                );

            setForm({
                companyDescription:
                updated.companyDescription,

                journalDescription:
                updated.journalDescription,

                logoMediaId:
                updated.logoMediaId,
            });

            setSuccess(
                "Footer Settings saved successfully.",
            );
        } catch (saveError) {
            console.error(
                "Footer Settings save failed",
                saveError,
            );

            setError(
                saveError instanceof
                Error
                    ? saveError.message
                    : "Footer Settings could not be saved.",
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
                    to="/admin/cms"
                    className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                >
                    ← Back to CMS
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                            Global Website
                        </p>

                        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                            Footer Settings
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            Manage Footer-specific
                            editorial copy and access
                            the Footer navigation
                            groups. Canonical contact
                            details and social profiles
                            remain in General Settings.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0c1724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />

                        {busy
                            ? "Saving..."
                            : "Save Footer"}
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

                <div className="mt-8 grid gap-6">
                    <SettingsSection
                        title="Company Description"
                        description="Footer-specific short description of Nepal Heaven. Address, email, phone and social links are intentionally managed from General Settings."
                        icon={
                            <FileText className="h-5 w-5" />
                        }
                    >
                        <CmsTextarea
                            label="Company Description"
                            value={
                                form.companyDescription
                            }
                            rows={6}
                            onChange={(
                                value,
                            ) =>
                                updateField(
                                    "companyDescription",
                                    value,
                                )
                            }
                        />

                        <CharacterCount
                            value={
                                form.companyDescription
                            }
                            maximum={2000}
                        />
                    </SettingsSection>

                    <SettingsSection
                        title="Journal / Newsletter Description"
                        description="Supporting copy displayed around Footer journal or newsletter content."
                        icon={
                            <FileText className="h-5 w-5" />
                        }
                    >
                        <CmsTextarea
                            label="Journal Description"
                            value={
                                form.journalDescription
                            }
                            rows={5}
                            onChange={(
                                value,
                            ) =>
                                updateField(
                                    "journalDescription",
                                    value,
                                )
                            }
                        />

                        <CharacterCount
                            value={
                                form.journalDescription
                            }
                            maximum={1200}
                        />
                    </SettingsSection>

                    <SettingsSection
                        title="Footer Navigation"
                        description="Footer navigation links are managed through the shared Navigation CMS rather than duplicated inside Footer Settings."
                        icon={
                            <Navigation className="h-5 w-5" />
                        }
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            {footerMenus.map(
                                (menu) => (
                                    <section
                                        key={
                                            menu.key
                                        }
                                        className="rounded-xl border border-black/10 bg-black/[0.015] p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-[#0c1724]">
                                                    {
                                                        menu.name
                                                    }
                                                </h3>

                                                <code className="mt-1 block text-xs text-muted-foreground">
                                                    {
                                                        menu.key
                                                    }
                                                </code>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xl font-semibold text-[#0c1724]">
                                                    {
                                                        menu.itemCount
                                                    }
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    items
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                            {
                                                menu.description
                                            }
                                        </p>

                                        <Link
                                            to="/admin/cms/navigation/$key"
                                            params={{
                                                key:
                                                menu.key,
                                            }}
                                            className="mt-4 inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#0c1724] transition hover:bg-black/5"
                                        >
                                            Edit links
                                        </Link>
                                    </section>
                                ),
                            )}
                        </div>
                    </SettingsSection>

                    <SettingsSection
                        title="Footer Logo"
                        description="Choose the Footer-specific logo from the shared Media Library."
                        icon={
                            <Image className="h-5 w-5" />
                        }
                    >
                        <CmsMediaPicker
                            label="Footer Logo"
                            description="Used when the Footer requires a different logo from the main global logo."
                            value={
                                form.logoMediaId
                            }
                            images={
                                images
                            }
                            onChange={(
                                id,
                            ) =>
                                setForm(
                                    (
                                        current,
                                    ) => ({
                                        ...current,

                                        logoMediaId:
                                        id,
                                    }),
                                )
                            }
                        />
                    </SettingsSection>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />

                            {busy
                                ? "Saving..."
                                : "Save Footer"}
                        </button>
                    </div>
                </div>
            </form>
        </AdminShell>
    );
}

function SettingsSection({
                             title,
                             description,
                             icon,
                             children,
                         }: {
    title: string;
    description: string;

    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:p-7">
            <div className="flex gap-3 border-b border-black/10 pb-5">
                <div className="mt-0.5 text-gold">
                    {icon}
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-[#0c1724]">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <div className="pt-6">
                {children}
            </div>
        </section>
    );
}

function CmsTextarea({
                         label,
                         value,
                         rows,
                         onChange,
                     }: {
    label: string;
    value: string;
    rows: number;

    onChange: (
        value: string,
    ) => void;
}) {
    return (
        <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">
        {label}
      </span>

            <textarea
                value={value}
                rows={rows}
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-[#0c1724] outline-none transition focus:border-gold"
            />
        </label>
    );
}

function CharacterCount({
                            value,
                            maximum,
                        }: {
    value: string;
    maximum: number;
}) {
    return (
        <p className="mt-2 text-right text-xs text-muted-foreground">
            {value.length.toLocaleString()} /{" "}
            {maximum.toLocaleString()}
        </p>
    );
}