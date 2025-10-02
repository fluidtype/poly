"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { ExternalLink, Flag } from "lucide-react";

import type { GdeltEvent } from "@/types";
import { normalizeGdeltDate } from "@/hooks/utils";

interface GdeltEventsListProps {
  events: GdeltEvent[];
  activeDate?: string;
  onOpen?: (event: GdeltEvent) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface NormalizedEvent {
  original: GdeltEvent;
  id: string;
  isoDate: string;
  hostname: string;
  path: string;
  tone?: number;
  eventCode?: string;
  countryCodes: string[];
}

function truncate(value: string, max = 48) {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1)}…`;
}

function getHostnameAndPath(url?: string) {
  if (!url) {
    return { hostname: "", path: "" };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./i, "");
    const path = parsed.pathname === "/" && !parsed.search ? "" : `${parsed.pathname}${parsed.search}`;
    return { hostname, path };
  } catch (error) {
    return { hostname: url, path: "" };
  }
}

function isNegativeEvent(code?: string, tone?: number) {
  if (!code) {
    return tone != null && tone < 0;
  }

  const numeric = Number.parseInt(code, 10);
  if (Number.isNaN(numeric)) {
    return tone != null && tone < 0;
  }

  return numeric >= 180 || (tone != null && tone < 0);
}

function toneLabel(tone?: number) {
  if (tone == null) {
    return "–";
  }

  return tone.toFixed(1);
}

export function GdeltEventsList({
  events,
  activeDate,
  onOpen,
  isLoading = false,
  error,
}: GdeltEventsListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedEvents = useMemo<NormalizedEvent[]>(() => {
    return events.slice(0, 500).map((event, index) => {
      const isoDate = normalizeGdeltDate(event.SQLDATE);
      const { hostname, path } = getHostnameAndPath(String(event.SOURCEURL ?? ""));
      const tone = typeof event.AvgTone === "number" ? event.AvgTone : undefined;
      const countryCodes = [
        typeof event.Actor1CountryCode === "string" ? event.Actor1CountryCode : undefined,
        typeof (event as any).Actor2CountryCode === "string" ? (event as any).Actor2CountryCode : undefined,
      ].filter(Boolean) as string[];

      return {
        original: event,
        id: `${isoDate}-${hostname}-${path}-${index}`,
        isoDate,
        hostname,
        path,
        tone,
        eventCode: typeof event.EventCode === "string" ? event.EventCode : undefined,
        countryCodes,
      };
    });
  }, [events]);

  const rowVirtualizer = useVirtualizer({
    count: normalizedEvents.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 88,
    overscan: 12,
  });

  if (isLoading) {
    return (
      <div className="relative h-[400px] rounded-3xl bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface-2)] p-4">
        <div className="flex flex-col gap-4">
          <div className="h-6 w-40 animate-pulse rounded-full bg-gradient-to-r from-[color:var(--surface-2)] to-[color:var(--surface-3)]" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl bg-gradient-to-r from-[color:var(--surface-2)] via-[color:var(--surface-3)] to-[color:var(--surface-2)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-[400px] rounded-3xl border border-red-400/40 bg-red-500/10 p-4 text-red-200">
        <p className="text-sm font-medium">Unable to load GDELT events</p>
        <p className="mt-2 text-xs opacity-80">{error}</p>
      </div>
    );
  }

  if (normalizedEvents.length === 0) {
    return (
      <div className="relative flex h-[400px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface-2)] p-4 text-sm text-[color:var(--muted)]">
        <p>No GDELT events found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] overflow-hidden rounded-3xl bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface-2)] p-4 shadow-lg shadow-black/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[color:var(--text)]">Event stream</h3>
          <p className="text-xs text-[color:var(--muted)]">Live slice of the latest {normalizedEvents.length.toLocaleString()} articles.</p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="mt-4 h-[320px] overflow-y-auto pr-2"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const event = normalizedEvents[virtualRow.index];
            const isActive = activeDate && event.isoDate === activeDate;
            const negative = isNegativeEvent(event.eventCode, event.tone);

            return (
              <div
                key={event.id}
                data-index={virtualRow.index}
                className="absolute left-0 right-0 px-1"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen?.(event.original)}
                  onKeyDown={(keyboardEvent) => {
                    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                      keyboardEvent.preventDefault();
                      onOpen?.(event.original);
                    }
                  }}
                  className={clsx(
                    "group flex h-full cursor-pointer flex-col justify-center rounded-2xl border border-transparent bg-[color:var(--surface-2)]/40 px-4 py-3 shadow-sm shadow-black/5 transition",
                    isActive && "border-[color:var(--primary)]/60 bg-[color:var(--primary)]/10",
                    !isActive && "hover:border-[color:var(--primary)]/40 hover:bg-[color:var(--surface-2)]/70",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[color:var(--text)]">
                        {event.hostname || "Unknown source"}
                      </p>
                      {event.path && (
                        <p className="truncate text-xs text-[color:var(--muted)]">{truncate(event.path)}</p>
                      )}
                      {event.isoDate && (
                        <p className="mt-1 text-xs uppercase tracking-wide text-[color:var(--muted)]">{event.isoDate}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {event.eventCode && (
                        <span
                          className={clsx(
                            "rounded-full border px-2 py-0.5 text-xs font-medium",
                            negative
                              ? "border-red-500/40 bg-red-500/15 text-red-200"
                              : "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/15 text-[color:var(--primary)]",
                          )}
                        >
                          Code {event.eventCode}
                        </span>
                      )}
                      {event.tone != null && (
                        <span
                          className={clsx(
                            "rounded-full border px-2 py-0.5 text-xs font-semibold",
                            event.tone > 1
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                              : event.tone < -1
                              ? "border-red-500/40 bg-red-500/15 text-red-200"
                              : "border-[color:var(--border)]/60 bg-[color:var(--surface-3)]/40 text-[color:var(--text)]",
                          )}
                        >
                          Tone {toneLabel(event.tone)}
                        </span>
                      )}
                      {event.countryCodes.length > 0 && (
                        <span className="flex items-center gap-2">
                          {event.countryCodes.map((code) => (
                            <span
                              key={`${event.id}-${code}`}
                              className="flex items-center gap-1 rounded-full border border-[color:var(--border)]/60 bg-[color:var(--surface-3)]/40 px-2 py-0.5 text-xs text-[color:var(--text)]"
                            >
                              <Flag className="h-3 w-3 opacity-60" aria-hidden="true" />
                              {code}
                            </span>
                          ))}
                        </span>
                      )}
                      {event.original.SOURCEURL && (
                        <Link
                          href={event.original.SOURCEURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[color:var(--text)] transition hover:border-[color:var(--primary)]/50 hover:bg-[color:var(--primary)]/20"
                          onClick={(clickEvent) => clickEvent.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Open source</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GdeltEventsList;
