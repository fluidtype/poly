"use client";

import { InsightsPanel } from "@/components/gdelt/InsightsPanel";
import type { GdeltInsights } from "@/types";

interface GdeltSummaryProps {
  insights?: GdeltInsights;
  loading: boolean;
  error: string | null;
}

export default function GdeltSummary({ insights, loading, error }: GdeltSummaryProps) {
  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-[color:var(--border)]/60 px-5 py-3">
        <div>
          <h3 className="text-base font-semibold text-[color:var(--fg)]">Narrative summary</h3>
          <p className="text-xs text-[color:var(--muted)]">Top actors, spikes and keyword matches</p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden px-4 py-3">
        <InsightsPanel insights={insights} isLoading={loading} error={error ?? undefined} />
      </div>
    </div>
  );
}
