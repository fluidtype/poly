"use client";

import { SearchInput } from "@/components/search/SearchInput";
import { cn } from "@/lib/utils";

export type SearchBarProps = {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSearch?: (keywords: string[]) => void;
};

export default function SearchBar({
  loading = false,
  error = null,
  onRetry,
  onSearch,
}: SearchBarProps) {
  return (
    <div className="mx-auto w-full max-w-[760px]">
      <SearchInput loading={loading} onSearch={onSearch} />

      <div className="pointer-events-none mt-1 h-[2px] rounded-full bg-[radial-gradient(60%_80%_at_50%_50%,rgba(224,36,36,0.45),transparent)]" />

      {error && (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-100">
          <span>{error}</span>
          {onRetry && (
            <button
              type="button"
              className={cn(
                "rounded-2xl border border-red-500/40 px-3 py-1 text-xs uppercase tracking-wide text-red-100 transition",
                "hover:bg-red-500/20"
              )}
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
