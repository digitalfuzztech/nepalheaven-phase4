import {
    Loader2,
    Trash2,
    X,
} from "lucide-react";

export function CmsMediaDeleteDialog({
                                         open,
                                         itemName,
                                         busy,
                                         error,
                                         onNo,
                                         onYes,
                                     }: {
    open:
        boolean;

    itemName:
        string;

    busy:
        boolean;

    error?:
        string;

    onNo:
        () => void;

    onYes:
        () => void;
}) {
    if (
        !open
    ) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 px-4">
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-media-title"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
                        <Trash2 className="h-5 w-5" />
                    </div>

                    <button
                        type="button"
                        onClick={
                            onNo
                        }
                        disabled={
                            busy
                        }
                        className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-black/5 disabled:opacity-50"
                        aria-label="Close delete confirmation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <h2
                    id="delete-media-title"
                    className="mt-5 text-xl font-semibold text-[#0c1724]"
                >
                    Do you really want to delete?
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-[#0c1724]">
                        {itemName}
                    </span>{" "}
                    will be permanently
                    removed from the
                    Media Library.
                </p>

                {error ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={
                            onNo
                        }
                        disabled={
                            busy
                        }
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[#0c1724] transition hover:bg-black/[0.03] disabled:opacity-50"
                    >
                        No
                    </button>

                    <button
                        type="button"
                        onClick={
                            onYes
                        }
                        disabled={
                            busy
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}

                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
}