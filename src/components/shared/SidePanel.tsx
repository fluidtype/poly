"use client";

import * as React from "react";
import Link from "next/link";

import { ExternalLink, Share2, Copy, RefreshCcw } from "lucide-react";

import { usePolyMarketDetails } from "@/hooks/usePolyMarketDetails";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/components/ui/use-toast";
import { useSidePanel } from "@/stores/useSidePanel";
import type { PolyMarket } from "@/types";

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return numberFormatter.format(value);
}

function formatDate(value?: string | number | null) {
  if (!value) return "—";

  const date = typeof value === "string" ? new Date(value) : new Date(value * 1000);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeSqlDate(value?: string | number) {
  if (!value) return "—";

  const raw = typeof value === "number" ? value.toString() : value;
  if (/^\d{8}$/.test(raw)) {
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(4, 6)) - 1;
    const day = Number(raw.slice(6, 8));
    const utcDate = new Date(Date.UTC(year, month, day));
    if (!Number.isNaN(utcDate.getTime())) {
      return utcDate.toISOString().split("T")[0];
    }
  }

  const fallback = new Date(raw);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toISOString().split("T")[0];
  }

  return "—";
}

function EventContent() {
  const { payload } = useSidePanel();
  const { toast } = useToast();

  const eventData = React.useMemo(
    () => (payload?.json && typeof payload.json === "object" ? payload.json : null),
    [payload?.json],
  );

  const eventUrl = React.useMemo(() => {
    const provided = typeof payload?.url === "string" ? payload.url : undefined;
    if (provided) return provided;

    if (eventData && "SOURCEURL" in eventData && typeof (eventData as Record<string, unknown>).SOURCEURL === "string") {
      return (eventData as Record<string, string>).SOURCEURL;
    }

    return undefined;
  }, [eventData, payload?.url]);

  const eventTitle = React.useMemo(() => {
    if (typeof payload?.title === "string") return payload.title;
    if (eventData && "DocumentIdentifier" in eventData && typeof (eventData as Record<string, unknown>).DocumentIdentifier === "string") {
      return (eventData as Record<string, string>).DocumentIdentifier;
    }
    if (eventData && "Actor1Name" in eventData && typeof (eventData as Record<string, unknown>).Actor1Name === "string") {
      return (eventData as Record<string, string>).Actor1Name;
    }
    return undefined;
  }, [eventData, payload?.title]);

  const eventDateRaw = React.useMemo(() => {
    if (!eventData) return undefined;
    const candidate = (eventData as Record<string, unknown>).SQLDATE;
    return typeof candidate === "string" || typeof candidate === "number" ? candidate : undefined;
  }, [eventData]);

  const eventDate = React.useMemo(() => normalizeSqlDate(eventDateRaw), [eventDateRaw]);

  const handleShare = React.useCallback(async () => {
    if (!eventUrl) {
      toast({
        title: "No link available",
        description: "This event does not include a public source URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: eventTitle?.toString() ?? "GDELT Event",
          url: eventUrl,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(eventUrl);
        toast({
          title: "Link copied",
          description: "Event URL copied to clipboard.",
        });
        return;
      }
    } catch (error) {
      console.error("Share failed", error);
    }

    toast({
      title: "Share unavailable",
      description: "We couldn't share this event automatically.",
      variant: "destructive",
    });
  }, [eventTitle, eventUrl, toast]);

  if (!eventData) {
    return (
      <div className="card space-y-3 rounded-3xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/60 p-6 text-sm text-[color:var(--muted)]">
        No event selected.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3 rounded-3xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/70 p-5 shadow-lg shadow-black/5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-[color:var(--muted)]">Event Date</p>
            <p className="text-base font-semibold text-[color:var(--text)]">{eventDate}</p>
          </div>
          {eventUrl ? (
            <Link
              className="inline-flex items-center gap-1 rounded-full border border-[color:var(--primary)]/60 bg-[color:var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--primary)] transition hover:bg-[color:var(--primary)]/20"
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
        <div className="card compact rounded-2xl border border-dashed border-[color:var(--border)]/60 bg-[color:var(--surface)]/50 p-4 text-xs">
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-[color:var(--muted)]">
            {JSON.stringify(eventData, null, 2)}
          </pre>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={handleShare} size="sm" className="rounded-full px-4">
            <Share2 className="h-4 w-4" /> Share event
          </Button>
        </div>
      </div>
    </div>
  );
}

function MarketSkeleton() {
  return (
    <div className="card space-y-4 rounded-3xl border border-[color:var(--border)]/50 bg-[color:var(--surface-2)]/50 p-5">
      <div className="h-5 w-1/2 animate-pulse rounded-full bg-[color:var(--surface-3)]/80" />
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded-2xl bg-[color:var(--surface-3)]/70" />
        <div className="h-10 animate-pulse rounded-2xl bg-[color:var(--surface-3)]/70" />
      </div>
      <div className="h-32 animate-pulse rounded-3xl bg-[color:var(--surface-3)]/50" />
    </div>
  );
}

function MarketError({ message }: { message: string }) {
  return (
    <div className="card space-y-2 rounded-3xl border border-red-500/50 bg-red-500/10 p-5 text-sm text-red-100">
      <p className="font-semibold">Unable to load market</p>
      <p className="text-xs text-red-200">{message}</p>
    </div>
  );
}

function MarketContent({ market }: { market: PolyMarket | null }) {
  const { toast } = useToast();

  if (!market) {
    return (
      <div className="card space-y-3 rounded-3xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/60 p-6 text-sm text-[color:var(--muted)]">
        Market details are not available.
      </div>
    );
  }

  const polymarketUrl = `https://polymarket.com/market/${market.id}`;

  const handleCopyId = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(market.id);
      toast({
        title: "Market ID copied",
        description: "You can now share or debug this market.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-4 rounded-3xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/70 p-5 shadow-lg shadow-black/5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[color:var(--text)]">{market.title}</h2>
          <div className="flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
            <span className="rounded-full bg-[color:var(--surface-3)]/60 px-3 py-1">
              Status: <span className="font-semibold text-[color:var(--text)]">{market.status}</span>
            </span>
            {market.category ? (
              <span className="rounded-full bg-[color:var(--surface-3)]/60 px-3 py-1">
                Category: <span className="font-semibold text-[color:var(--text)]">{market.category}</span>
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="card compact space-y-1 rounded-2xl border border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 p-4">
            <span className="text-xs uppercase tracking-wide text-[color:var(--muted)]">YES</span>
            <span className="text-xl font-semibold text-emerald-300">
              {formatNumber(market.priceYes ?? market.tokens.find((token) => token.outcome === "YES")?.price ?? null)}
            </span>
          </div>
          <div className="card compact space-y-1 rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
            <span className="text-xs uppercase tracking-wide text-[color:var(--muted)]">NO</span>
            <span className="text-xl font-semibold text-red-200">
              {formatNumber(market.priceNo ?? market.tokens.find((token) => token.outcome === "NO")?.price ?? null)}
            </span>
          </div>
        </div>
        <div className="card compact space-y-3 rounded-2xl border border-dashed border-[color:var(--border)]/60 bg-[color:var(--surface)]/60 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--muted)]">24h Volume</span>
            <span className="font-semibold">{formatNumber(market.volume24h)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--muted)]">Liquidity</span>
            <span className="font-semibold">{formatNumber(market.liquidity)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[color:var(--muted)]">End Date</span>
            <span className="font-semibold">{market.endDate ? formatDate(market.endDate) : "—"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href={polymarketUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Open on Polymarket
            </Link>
          </Button>
          <Button type="button" onClick={handleCopyId} size="sm" variant="outline" className="rounded-full px-4">
            <Copy className="h-4 w-4" /> Copy Market ID
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SidePanel() {
  const { isOpen, mode, payload, closePanel } = useSidePanel();
  const marketId = mode === "market" ? payload?.id : undefined;
  const {
    data: marketData,
    isLoading: isMarketLoading,
    isError: isMarketError,
    error: marketError,
    refetch,
  } = usePolyMarketDetails({ id: marketId });

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        closePanel();
      }
    },
    [closePanel],
  );

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="w-full max-w-[420px] border-l border-[color:var(--border)]/60 bg-[color:var(--surface)]/95">
        <DrawerHeader className="flex flex-col gap-1">
          <DrawerTitle>
            {mode === "event" ? "Event Details" : "Market Details"}
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {mode === "event" ? (
            <EventContent />
          ) : isMarketLoading ? (
            <MarketSkeleton />
          ) : isMarketError ? (
            <div className="space-y-4">
              <MarketError message={marketError instanceof Error ? marketError.message : "Unknown error"} />
              <Button
                type="button"
                onClick={() => refetch()}
                size="sm"
                variant="outline"
                className="rounded-full"
              >
                <RefreshCcw className="h-4 w-4" /> Retry
              </Button>
            </div>
          ) : (
            <MarketContent market={marketData?.market ?? null} />
          )}
        </div>
        <DrawerFooter className="flex items-center justify-end">
          <DrawerClose asChild>
            <Button variant="ghost">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
