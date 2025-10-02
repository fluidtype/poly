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
  } catch {
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
      const countryCodes = Array.from(
        new Set(
          [
            typeof event.Actor1CountryCode === "string" ? event.Actor1CountryCode : undefined,
            typeof event.Actor2CountryCode === "string" ? event.Actor2CountryCode : undefined,
          ].filter((code): code is string => Boolean(code)),
        ),
      );

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
    estimateSize: () => 92,
    overscan: 12,
  });

  if (isLoading) {
    return (
      <div className="card flex h-full min-h-[320px] flex-col gap-4 rounded-2xl bg-[rgb(var(--surface2))]/70 p-6">
        <div className="h-6 w-48 animate-pulse rounded-full bg-[rgb(var(--surface3))]/70" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl bg-[rgb(var(--surface3))]/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card flex h-full min-h-[320px] flex-col justify-center gap-2 rounded-2xl border border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/10 p-6 text-sm text-[rgb(var(--accent-light))]">
        <p className="font-medium">Unable to load GDELT events</p>
        <p className="text-xs opacity-80">{error}</p>
      </div>
    );
  }

  if (normalizedEvents.length === 0) {
    return (
      <div className="card flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--borderc))]/70 bg-[rgb(var(--surface2))]/70 p-6 text-sm text-[rgb(var(--muted))]">
        <p>No GDELT events found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="card flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl bg-[rgb(var(--surface2))]/90">
      <div className="flex items-center justify-between border-b border-[rgb(var(--borderc))]/60 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold text-[rgb(var(--text))]">Event stream</h3>
          <p className="meta mt-1">Live slice of the latest {normalizedEvents.length.toLocaleString()} articles.</p>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 pb-6 pt-4">
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
                className="absolute left-0 right-0 px-3"
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
                    "group flex h-full cursor-pointer flex-col justify-center rounded-2xl border border-transparent bg-[rgb(var(--surface))]/40 px-4 py-3 transition",
                    isActive && "border-[rgb(var(--brand))]/60 bg-[rgb(var(--brand))]/15",
                    !isActive && "hover:border-[rgb(var(--brand))]/40 hover:bg-[rgb(var(--surface))]/60",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[rgb(var(--text))]">
                        {event.hostname || "Unknown source"}
                      </p>
                      {event.path && (
                        <p className="truncate text-xs text-[rgb(var(--muted))]">{truncate(event.path)}</p>
                      )}
                      {event.isoDate && (
                        <p className="meta mt-1 uppercase tracking-[0.2em]">{event.isoDate}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {event.eventCode && (
                        <span
                          className={clsx(
                            "pill border px-2 py-0 text-xs font-medium",
                            negative
                              ? "border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/15 text-[rgb(var(--accent-light))]"
                              : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
                          )}
                        >
                          Code {event.eventCode}
                        </span>
                      )}
                      {event.tone != null && (
                        <span
                          className={clsx(
                            "pill px-2 py-0 text-xs font-semibold",
                            event.tone > 1
                              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                              : event.tone < -1
                              ? "border-[rgb(var(--brand))]/40 bg-[rgb(var(--brand))]/15 text-[rgb(var(--accent-light))]"
                              : "border-[rgb(var(--borderc))]/60 bg-[rgb(var(--surface))]/50 text-[rgb(var(--text))]/90",
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
                              className="pill gap-1 border-[rgb(var(--borderc))]/60 bg-[rgb(var(--surface))]/50 text-xs text-[rgb(var(--text))]/80"
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
                          className="iconbtn text-[rgb(var(--text))] transition hover:border-[rgb(var(--brand))]/60 hover:bg-[rgb(var(--brand))]/20"
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
