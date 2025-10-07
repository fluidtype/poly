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
    <div className="card-surface card-hover flex h-full flex-col overflow-hidden rounded-2xl">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:px-5 md:py-4">
        <div className="space-y-1">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Narrative summary</h3>
          <p className="text-[11px] text-white/50">Top actors, spikes and keyword matches</p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden px-3 py-3 md:px-4">
        <div className="scroll-stable h-full overflow-auto pr-1">
          <InsightsPanel insights={insights} isLoading={loading} error={error ?? undefined} />
        </div>
      </div>
    </div>
  );
}
