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
      <div className="card flex h-full items-center justify-center text-sm text-[color:var(--muted)]">
        Enable the GDELT dataset to browse event context.
      </div>
    );
  }

  return (
    <div className="card flex h-full flex-col">
      <Header page={page} pages={pages} onPrev={() => setPage((p) => Math.max(1, p - 1))} onNext={() => setPage((p) => Math.min(pages, p + 1))} />
      <div className="flex-1 px-4 py-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="h-14 w-full animate-pulse rounded-2xl bg-[color:var(--panel-strong)]/60" />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-[color:var(--accent-light)]">{error}</div>
        ) : entries.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[color:var(--muted)]">No events in the selected range.</div>
        ) : (
          <ul className="space-y-3 text-sm text-[color:var(--muted)]">
            {entries.map((event, index) => (
              <li key={`${event.SOURCEURL ?? event.SQLDATE}-${index}`} className="rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--panel)]/50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onOpenEvent?.(event)}
                  className="text-left"
                >
                  <p className="text-xs uppercase tracking-[0.28em]">{event.Actor1CountryCode ?? ""}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-[color:var(--fg)]">{event.SOURCEURL ?? "Event"}</p>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{formatDate(event.SQLDATE)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Header({ page, pages, onPrev, onNext }: { page: number; pages: number; onPrev: () => void; onNext: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-[color:var(--border)]/60 px-5 py-3">
      <h3 className="text-base font-semibold text-[color:var(--fg)]">Event digest</h3>
      <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)]/70 transition hover:border-[color:var(--accent)]/50 hover:text-[color:var(--fg)]"
        >
          ◀
        </button>
        <span className="w-14 text-center font-semibold text-[color:var(--fg)]">
          {page}/{pages}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)]/70 transition hover:border-[color:var(--accent)]/50 hover:text-[color:var(--fg)]"
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
