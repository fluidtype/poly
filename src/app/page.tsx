"use client";

import Canvas from "@/features/polymuffin/ui/layout/Canvas";
import NavRail from "@/features/polymuffin/ui/layout/NavRail";
import Topbar from "@/features/polymuffin/ui/layout/Topbar";
import { H } from "@/features/polymuffin/constants/layout";
import TimeseriesPanel from "@/features/polymuffin/ui/panels/TimeseriesPanel";
import ActiveMarketsPanel from "@/features/polymuffin/ui/panels/ActiveMarketsPanel";
import KpiStrip from "@/features/polymuffin/ui/panels/KpiStrip";
import OddsDistribution from "@/features/polymuffin/ui/panels/OddsDistribution";
import GdeltSummary from "@/features/polymuffin/ui/panels/GdeltSummary";
import MarketsGrid from "@/features/polymuffin/ui/panels/MarketsGrid";
import NewsList from "@/features/polymuffin/ui/panels/NewsList";
import { usePolymuffinData } from "@/features/polymuffin/hooks/usePolymuffinData";

export default function Page() {
  const data = usePolymuffinData();

  const desktop = (
    <Canvas>
      <div
        className="grid h-full"
        style={{
          gridTemplateColumns: "72px 16px 1fr",
          padding: "24px",
        }}
      >
        <div className="h-full">
          <NavRail />
        </div>
        <div />
        <div
          className="grid h-full gap-4"
          style={{
            gridTemplateRows: `${H.TOPBAR}px ${H.ROW1}px ${H.ROW2}px ${H.ROW3}px`,
          }}
        >
          <Topbar loading={data.isFetchingAny} onRefresh={data.refresh} error={data.combinedError} />
          <div className="grid h-full grid-cols-12 gap-4">
            <div className="col-span-8 h-full overflow-hidden">
              <TimeseriesPanel
                enabled={data.gdelt.enabled}
                series={data.gdelt.series}
                aggregation={data.gdelt.aggregation}
                loading={data.gdelt.loading}
                error={data.gdelt.error}
                onDateClick={data.gdelt.setActiveDate}
              />
            </div>
            <div className="col-span-4 h-full overflow-hidden">
              <ActiveMarketsPanel
                datasets={data.activity.datasets}
                recentQueries={data.activity.recentQueries}
                loading={data.gdelt.loading || data.polymuffin.loading}
                error={data.combinedError}
              />
            </div>
          </div>
          <div className="grid h-full grid-cols-12 gap-4">
            <div className="col-span-4 h-full overflow-hidden">
              <KpiStrip
                totalEvents={data.kpis.totalEvents}
                avgTone={data.kpis.avgTone}
                avgImpact={data.kpis.avgImpact}
                topPair={data.kpis.topPair}
                loading={data.gdelt.loading}
                error={data.gdelt.error}
              />
            </div>
            <div className="col-span-4 h-full overflow-hidden">
              <OddsDistribution
                markets={data.polymuffin.markets}
                enabled={data.polymuffin.enabled}
                loading={data.polymuffin.loading}
                error={data.polymuffin.error}
              />
            </div>
            <div className="col-span-4 h-full overflow-hidden">
              <GdeltSummary
                insights={data.gdelt.insights}
                loading={data.gdelt.loading}
                error={data.gdelt.error}
              />
            </div>
          </div>
          <div className="grid h-full grid-cols-12 gap-4">
            <div className="col-span-8 h-full overflow-hidden">
              <MarketsGrid
                markets={data.polymuffin.markets}
                enabled={data.polymuffin.enabled}
                loading={data.polymuffin.loading}
                error={data.polymuffin.error}
                onOpenMarket={data.openMarket}
              />
            </div>
            <div className="col-span-4 h-full overflow-hidden">
              <NewsList
                events={data.gdelt.events}
                enabled={data.gdelt.enabled}
                loading={data.gdelt.loading}
                error={data.gdelt.error}
                onOpenEvent={data.openEvent}
              />
            </div>
          </div>
        </div>
      </div>
    </Canvas>
  );

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)]">
      <div className="hidden lg:block">{desktop}</div>
      <div className="flex h-screen w-full items-center justify-center px-6 text-center text-sm text-[color:var(--muted)] lg:hidden">
        Switch to a desktop viewport (≥1024px) to access the full dashboard experience.
      </div>
    </div>
  );
}
