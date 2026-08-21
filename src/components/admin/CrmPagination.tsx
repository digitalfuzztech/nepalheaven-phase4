import { ChevronLeft, ChevronRight } from "lucide-react";

export function CrmPagination({
  page,
  totalPages,
  total,
  label,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  label: string;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-[#faf9f6] px-4 py-4 sm:px-5">
      <p className="text-sm text-muted-foreground">
        {total.toLocaleString()} {label}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-[#0c1724] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="min-w-24 text-center text-sm font-medium text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-[#0c1724] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
