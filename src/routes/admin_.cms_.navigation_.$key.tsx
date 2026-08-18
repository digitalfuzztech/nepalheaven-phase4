import {
    createFileRoute,
    Link,
    redirect,
} from "@tanstack/react-router";

import {
    ArrowDown,
    ArrowUp,
    ExternalLink,
    Link2,
    Plus,
    Save,
    Trash2,
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
    getCmsNavigationMenuFn,
    updateCmsNavigationMenuFn,
} from "@/lib/cms-navigation.functions";

import {
    cmsNavigationMenuUpdateSchema,
    type CmsNavigationItemInput,
} from "@/lib/cms-navigation.schema";

export const Route =
    createFileRoute(
        "/admin_/cms_/navigation_/$key",
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
                            `/admin/cms/navigation/${params.key}`,
                    },
                });
            }

            const menu =
                await getCmsNavigationMenuFn(
                    {
                        data: {
                            key:
                            params.key,
                        },
                    },
                );

            return {
                admin,
                menu,
            };
        },

        component:
        NavigationMenuEditorPage,
    });

function NavigationMenuEditorPage() {
    const {
        menu,
    } = Route.useLoaderData();

    const [
        items,
        setItems,
    ] =
        useState<
            CmsNavigationItemInput[]
        >(menu.items);

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    function updateItem(
        index: number,
        update:
        Partial<CmsNavigationItemInput>,
    ) {
        setItems(
            (current) =>
                current.map(
                    (
                        item,
                        itemIndex,
                    ) =>
                        itemIndex ===
                        index
                            ? {
                                ...item,
                                ...update,
                            }
                            : item,
                ),
        );
    }

    function changeLinkType(
        index: number,
        linkType:
            | "internal"
            | "external",
    ) {
        updateItem(
            index,
            {
                linkType,

                path:
                    linkType ===
                    "internal"
                        ? "/"
                        : "",

                url:
                    linkType ===
                    "external"
                        ? "https://"
                        : "",
            },
        );
    }

    function addItem() {
        setItems(
            (current) => [
                ...current,

                {
                    label: "",

                    linkType:
                        "internal",

                    path: "/",

                    url: "",

                    enabled: true,

                    openNewTab:
                        false,
                },
            ],
        );
    }

    function removeItem(
        index: number,
    ) {
        setItems(
            (current) =>
                current.filter(
                    (
                        _,
                        itemIndex,
                    ) =>
                        itemIndex !==
                        index,
                ),
        );
    }

    function moveItem(
        index: number,
        direction:
            | "up"
            | "down",
    ) {
        setItems(
            (current) => {
                const destination =
                    direction === "up"
                        ? index - 1
                        : index + 1;

                if (
                    destination < 0 ||
                    destination >=
                    current.length
                ) {
                    return current;
                }

                const next = [
                    ...current,
                ];

                const currentItem =
                    next[index];

                const destinationItem =
                    next[
                        destination
                        ];

                if (
                    !currentItem ||
                    !destinationItem
                ) {
                    return current;
                }

                next[index] =
                    destinationItem;

                next[destination] =
                    currentItem;

                return next;
            },
        );
    }

    async function save(
        event: FormEvent,
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const parsed =
            cmsNavigationMenuUpdateSchema.safeParse(
                {
                    key:
                    menu.key,

                    items,
                },
            );

        if (!parsed.success) {
            setError(
                parsed.error.issues[0]
                    ?.message ??
                "Check the navigation items and try again.",
            );

            return;
        }

        setBusy(true);

        try {
            const updated =
                await updateCmsNavigationMenuFn(
                    {
                        data:
                        parsed.data,
                    },
                );

            setItems(
                updated.items,
            );

            setSuccess(
                "Navigation menu saved successfully.",
            );
        } catch (saveError) {
            console.error(
                "Navigation save failed",
                saveError,
            );

            setError(
                saveError instanceof
                Error
                    ? saveError.message
                    : "Navigation menu could not be saved.",
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
                    to="/admin/cms/navigation"
                    className="text-sm font-semibold text-muted-foreground transition hover:text-[#0c1724]"
                >
                    ← Back to Navigation
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                            Navigation Menu
                        </p>

                        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0c1724]">
                            {menu.name}
                        </h1>

                        <code className="mt-2 block text-sm text-muted-foreground">
                            {menu.key}
                        </code>

                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            {
                                menu.description
                            }
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
                            : "Save Menu"}
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

                <div className="mt-8 grid gap-4">
                    {items.map(
                        (
                            item,
                            index,
                        ) => (
                            <section
                                key={index}
                                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                                    <div>
                                        <p className="text-sm font-semibold text-[#0c1724]">
                                            Item{" "}
                                            {index + 1}
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Display position{" "}
                                            {index + 1}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <IconButton
                                            label="Move up"
                                            disabled={
                                                index === 0
                                            }
                                            onClick={() =>
                                                moveItem(
                                                    index,
                                                    "up",
                                                )
                                            }
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </IconButton>

                                        <IconButton
                                            label="Move down"
                                            disabled={
                                                index ===
                                                items.length -
                                                1
                                            }
                                            onClick={() =>
                                                moveItem(
                                                    index,
                                                    "down",
                                                )
                                            }
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </IconButton>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeItem(
                                                    index,
                                                )
                                            }
                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <CmsField
                                        label="Label"
                                        value={
                                            item.label
                                        }
                                        onChange={(
                                            value,
                                        ) =>
                                            updateItem(
                                                index,
                                                {
                                                    label:
                                                    value,
                                                },
                                            )
                                        }
                                    />

                                    <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[#0c1724]">
                      Link Type
                    </span>

                                        <select
                                            value={
                                                item.linkType
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                changeLinkType(
                                                    index,

                                                    event
                                                        .target
                                                        .value as
                                                        | "internal"
                                                        | "external",
                                                )
                                            }
                                            className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none focus:border-gold"
                                        >
                                            <option value="internal">
                                                Internal
                                            </option>

                                            <option value="external">
                                                External
                                            </option>
                                        </select>
                                    </label>

                                    {item.linkType ===
                                    "internal" ? (
                                        <div className="md:col-span-2">
                                            <CmsField
                                                label="Internal Path"
                                                value={
                                                    item.path
                                                }
                                                placeholder="/destinations"
                                                onChange={(
                                                    value,
                                                ) =>
                                                    updateItem(
                                                        index,
                                                        {
                                                            path:
                                                            value,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <div className="md:col-span-2">
                                            <CmsField
                                                label="External URL"
                                                value={
                                                    item.url
                                                }
                                                placeholder="https://example.com"
                                                onChange={(
                                                    value,
                                                ) =>
                                                    updateItem(
                                                        index,
                                                        {
                                                            url:
                                                            value,
                                                        },
                                                    )
                                                }
                                            />
                                        </div>
                                    )}

                                    <CheckboxField
                                        label="Enabled"
                                        description="Show this link when the menu is connected to the public site."
                                        checked={
                                            item.enabled
                                        }
                                        onChange={(
                                            checked,
                                        ) =>
                                            updateItem(
                                                index,
                                                {
                                                    enabled:
                                                    checked,
                                                },
                                            )
                                        }
                                    />

                                    <CheckboxField
                                        label="Open in new tab"
                                        description="Adds new-tab behavior when this link is rendered."
                                        checked={
                                            item.openNewTab
                                        }
                                        onChange={(
                                            checked,
                                        ) =>
                                            updateItem(
                                                index,
                                                {
                                                    openNewTab:
                                                    checked,
                                                },
                                            )
                                        }
                                    />
                                </div>

                                <div className="mt-5 flex items-center gap-2 rounded-xl bg-black/[0.025] px-4 py-3 text-xs text-muted-foreground">
                                    {item.linkType ===
                                    "internal" ? (
                                        <Link2 className="h-4 w-4" />
                                    ) : (
                                        <ExternalLink className="h-4 w-4" />
                                    )}

                                    {item.linkType ===
                                    "internal"
                                        ? item.path ||
                                        "No path"
                                        : item.url ||
                                        "No URL"}
                                </div>
                            </section>
                        ),
                    )}

                    {items.length ===
                    0 ? (
                        <div className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center">
                            <NavigationEmptyState />
                        </div>
                    ) : null}

                    <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#0c1724] transition hover:bg-black/5"
                    >
                        <Plus className="h-4 w-4" />
                        Add Menu Item
                    </button>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0c1724] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />

                        {busy
                            ? "Saving..."
                            : "Save Menu"}
                    </button>
                </div>
            </form>
        </AdminShell>
    );
}

function CmsField({
                      label,
                      value,
                      onChange,
                      placeholder,
                  }: {
    label: string;
    value: string;

    onChange: (
        value: string,
    ) => void;

    placeholder?: string;
}) {
    return (
        <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#0c1724]">
        {label}
      </span>

            <input
                value={value}
                placeholder={
                    placeholder
                }
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.value,
                    )
                }
                className="h-11 rounded-xl border border-black/10 bg-white px-4 text-sm text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
            />
        </label>
    );
}

function CheckboxField({
                           label,
                           description,
                           checked,
                           onChange,
                       }: {
    label: string;
    description: string;
    checked: boolean;

    onChange: (
        checked: boolean,
    ) => void;
}) {
    return (
        <label className="flex cursor-pointer gap-3 rounded-xl border border-black/10 p-4">
            <input
                type="checkbox"
                checked={checked}
                onChange={(
                    event,
                ) =>
                    onChange(
                        event.target.checked,
                    )
                }
                className="mt-1 h-4 w-4"
            />

            <span>
        <span className="block text-sm font-semibold text-[#0c1724]">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
        </label>
    );
}

function IconButton({
                        label,
                        disabled,
                        onClick,
                        children,
                    }: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children:
        ReactNode;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-[#0c1724] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
        >
            {children}
        </button>
    );
}

function NavigationEmptyState() {
    return (
        <>
            <p className="text-sm font-semibold text-[#0c1724]">
                This menu has no items
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
                Add the first link below.
            </p>
        </>
    );
}