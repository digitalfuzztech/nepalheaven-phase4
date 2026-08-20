import {
    useState,
} from "react";

import {
    useRouter,
} from "@tanstack/react-router";

import {
    AlertTriangle,
    Check,
    Loader2,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";

import {
    cmsOtherSettingsGroups,
    type CmsOtherSettingsOption,
} from "@/lib/cms-other-settings.constants";

import {
    createCmsOtherSettingsOptionFn,
    deleteCmsOtherSettingsOptionFn,
    updateCmsOtherSettingsOptionFn,
} from "@/lib/cms-other-settings.functions";

export function CmsOtherSettingsManager({
                                            options,
                                        }: {
    options:
        CmsOtherSettingsOption[];
}) {
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            {cmsOtherSettingsGroups.map(
                (
                    group,
                ) => (
                    <OptionGroup
                        key={
                            group.key
                        }
                        group={
                            group
                        }
                        options={
                            options.filter(
                                (
                                    option,
                                ) =>
                                    option.groupKey ===
                                    group.key,
                            )
                        }
                    />
                ),
            )}
        </div>
    );
}

function OptionGroup({
                         group,
                         options,
                     }: {
    group: (typeof cmsOtherSettingsGroups)[number];

    options:
        CmsOtherSettingsOption[];
}) {
    const router =
        useRouter();

    const [
        input,
        setInput,
    ] =
        useState("");

    const [
        busy,
        setBusy,
    ] =
        useState(false);

    const [
        error,
        setError,
    ] =
        useState("");

    async function addOption() {
        const name =
            input.trim();

        if (
            !name ||
            busy
        ) {
            return;
        }

        setBusy(true);
        setError("");

        try {
            await createCmsOtherSettingsOptionFn({
                data: {
                    groupKey:
                    group.key,

                    name,
                },
            });

            setInput("");

            await router.invalidate();
        } catch (
            caught
            ) {
            console.error(
                "Other Settings option creation failed",
                caught,
            );

            setError(
                caught instanceof Error
                    ? caught.message
                    : "The option could not be added.",
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                    Other Settings
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#0c1724]">
                    {group.title}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {group.description}
                </p>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-[#0c1724]">
                        Examples:
                    </span>{" "}
                    {group.examples}
                </p>
            </div>

            <div className="mt-6 flex gap-2">
                <input
                    type="text"
                    value={
                        input
                    }
                    onChange={(
                        event,
                    ) =>
                        setInput(
                            event
                                .target
                                .value,
                        )
                    }
                    onKeyDown={(
                        event,
                    ) => {
                        if (
                            event.key ===
                            "Enter"
                        ) {
                            event.preventDefault();

                            void addOption();
                        }
                    }}
                    placeholder={
                        group.placeholder
                    }
                    className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-[#faf9f6] px-4 text-sm text-[#0c1724] outline-none transition placeholder:text-muted-foreground focus:border-gold"
                />

                <button
                    type="button"
                    onClick={
                        addOption
                    }
                    disabled={
                        busy ||
                        !input.trim()
                    }
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0c1724] px-4 text-sm font-semibold text-white transition hover:bg-[#16283b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gold" />
                    ) : (
                        <Plus className="h-4 w-4 text-gold" />
                    )}

                    Add
                </button>
            </div>

            {error ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Available{" "}
                        {group.title}
                    </p>

                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {options.length}
                    </span>
                </div>

                {options.length ? (
                    <div className="grid gap-2">
                        {options.map(
                            (
                                option,
                            ) => (
                                <OptionRow
                                    key={
                                        option.id
                                    }
                                    option={
                                        option
                                    }
                                />
                            ),
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-black/10 bg-[#faf9f6] px-4 py-8 text-center">
                        <p className="text-sm font-medium text-[#0c1724]">
                            No options
                            added yet.
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Add the first
                            option above.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

function OptionRow({
                       option,
                   }: {
    option:
        CmsOtherSettingsOption;
}) {
    const router =
        useRouter();

    const [
        editing,
        setEditing,
    ] =
        useState(false);

    const [
        value,
        setValue,
    ] =
        useState(
            option.name,
        );

    const [
        saving,
        setSaving,
    ] =
        useState(false);

    const [
        deleting,
        setDeleting,
    ] =
        useState(false);

    const [
        confirmingDelete,
        setConfirmingDelete,
    ] =
        useState(false);

    const [
        saved,
        setSaved,
    ] =
        useState(false);

    const [
        error,
        setError,
    ] =
        useState("");

    function cancelEdit() {
        setValue(
            option.name,
        );

        setEditing(
            false,
        );

        setError("");
    }

    async function save() {
        const name =
            value.trim();

        if (
            !name ||
            saving
        ) {
            return;
        }

        setSaving(true);
        setSaved(false);
        setError("");

        try {
            await updateCmsOtherSettingsOptionFn({
                data: {
                    id:
                    option.id,

                    name,
                },
            });

            setEditing(false);
            setSaved(true);

            await router.invalidate();

            window.setTimeout(
                () =>
                    setSaved(
                        false,
                    ),
                1500,
            );
        } catch (
            caught
            ) {
            console.error(
                "Other Settings option update failed",
                caught,
            );

            setError(
                caught instanceof Error
                    ? caught.message
                    : "The option could not be saved.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (
            deleting
        ) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            await deleteCmsOtherSettingsOptionFn({
                data: {
                    id:
                    option.id,
                },
            });

            await router.invalidate();

            setConfirmingDelete(false);
        } catch (
            caught
            ) {
            console.error(
                "Other Settings option deletion failed",
                caught,
            );

            setError(
                caught instanceof Error
                    ? caught.message
                    : "The option could not be deleted.",
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-3">
            <div className="flex items-center gap-2">
                {editing ? (
                    <input
                        type="text"
                        autoFocus
                        value={
                            value
                        }
                        onChange={(
                            event,
                        ) =>
                            setValue(
                                event
                                    .target
                                    .value,
                            )
                        }
                        onKeyDown={(
                            event,
                        ) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                event.preventDefault();

                                void save();
                            }

                            if (
                                event.key ===
                                "Escape"
                            ) {
                                cancelEdit();
                            }
                        }}
                        className="h-10 min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium text-[#0c1724] outline-none focus:border-gold"
                    />
                ) : (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0c1724]">
                            {option.name}
                        </p>
                    </div>
                )}

                {editing ? (
                    <>
                        <button
                            type="button"
                            disabled={
                                saving ||
                                !value.trim()
                            }
                            onClick={
                                save
                            }
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-emerald-200 bg-white text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                            aria-label={`Save ${option.name}`}
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                        </button>

                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={
                                cancelEdit
                            }
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-black/10 bg-white text-muted-foreground transition hover:bg-black/5"
                            aria-label="Cancel editing"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </>
                ) : (
                    <>
                        {saved ? (
                            <span className="grid h-10 w-10 shrink-0 place-items-center text-emerald-600">
                                <Check className="h-4 w-4" />
                            </span>
                        ) : null}

                        <button
                            type="button"
                            onClick={() =>
                                setEditing(
                                    true,
                                )
                            }
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-black/10 bg-white text-[#0c1724] transition hover:bg-black/5"
                            aria-label={`Edit ${option.name}`}
                        >
                            <Pencil className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            disabled={
                                deleting
                            }
                            onClick={() =>
                                setConfirmingDelete(true)
                            }
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            aria-label={`Delete ${option.name}`}
                        >
                            {deleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </button>
                    </>
                )}
            </div>

            {error ? (
                <p className="mt-2 text-xs text-red-700">
                    {error}
                </p>
            ) : null}

            {confirmingDelete ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={() => !deleting && setConfirmingDelete(false)}>
                    <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="flex items-center gap-4 border-b border-black/10 p-6">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
                            <div><p className="text-xs font-bold uppercase tracking-wider text-red-600">Permanent action</p><h2 className="mt-1 text-xl font-semibold text-[#0c1724]">Delete option?</h2></div>
                        </div>
                        <div className="p-6 text-sm leading-6 text-muted-foreground">Delete <strong className="text-[#0c1724]">{option.name}</strong>? Existing stable references will be set to null where configured; legacy display text remains available.</div>
                        <div className="flex justify-end gap-3 border-t border-black/10 bg-[#f8f8f6] p-5">
                            <button type="button" disabled={deleting} onClick={() => setConfirmingDelete(false)} className="rounded-xl border bg-white px-5 py-3 text-sm font-semibold">Cancel</button>
                            <button type="button" disabled={deleting} onClick={() => void remove()} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete permanently</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
