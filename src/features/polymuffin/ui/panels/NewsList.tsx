"use client";

import { useEffect, useMemo, useState } from "react";

import type { GdeltEvent } from "@/types";

const PAGE_SIZE = 6;

type NewsListProps = {
  events: GdeltEvent[];
  enabled: boolean;
  loading: boolean;
  error: string | null;
  onOpenEvent?: (event: GdeltEvent) => void;
};

export default function NewsList({ events, enabled, loading, error, onOpenEvent }: NewsListProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [events]);

  const pages = Math.max(1, Math.ceil((events?.length ?? 0) / PAGE_SIZE));
  const entries = useMemo(() => {
    if (!enabled) {
      return [];
    }
    const start = (page - 1) * PAGE_SIZE;
    return events.slice(start, start + PAGE_SIZE);
  }, [enabled, events, page]);

  if (!enabled) {
    return (
      <div className="card-surface card-surface--secondary card-hover flex h-full items-center justify-center rounded-2xl text-sm text-white/60">
        Enable the GDELT dataset to browse event context.
      </div>
    );
  }

  return (
    <div className="card-surface card-surface--secondary card-hover flex h-full flex-col overflow-hidden rounded-2xl">
      <Header page={page} pages={pages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(pages, p + 1))} />
      <div className="flex-1 overflow-hidden px-4 py-4">
        <div className="scroll-stable h-full overflow-auto pr-1">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div key={index} className="h-14 w-full skeleton" />
              ))}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-sm text-[#ff9da8]">{error}</div>
          ) : entries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-white/60">No events in the selected range.</div>
          ) : (
            <ul className="space-y-3 text-sm text-white/60">
              {entries.map((event, index) => (
                <li
                  key={`${event.SOURCEURL ?? event.SQLDATE}-${index}`}
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-[color:var(--primary)]/40"
                >
                  <button
                    type="button"
                    onClick={() => onOpenEvent?.(event)}
                    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(11,11,14,0.7)]"
                  >
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">{event.Actor1CountryCode ?? ""}</p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold tracking-tight text-white/90">
                      {event.SOURCEURL ?? "Event"}
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">{formatDate(event.SQLDATE)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({ page, pages, onPrev, onNext }: { page: number; pages: number; onPrev: () => void; onNext: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:px-5 md:py-4">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Event digest</h3>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 text-white/60 transition hover:border-[color:var(--primary)]/40 hover:text-white"
        >
          ◀
        </button>
        <span className="w-14 text-center font-semibold text-white">
          {page}/{pages}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 text-white/60 transition hover:border-[color:var(--primary)]/40 hover:text-white"
        >
          ▶
        </button>
      </div>
    </header>
  );
}

function formatDate(value: string | number | undefined) {
  if (value == null) {
    return "—";
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
