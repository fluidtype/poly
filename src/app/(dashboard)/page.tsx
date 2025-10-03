import { ActivityFeedPanel } from "./_components/activity-feed-panel";
import { DashboardHeader } from "./_components/dashboard-header";
import { MarketHighlightsPanel } from "./_components/market-highlights-panel";
import { MomentumPanel } from "./_components/momentum-panel";
import { OverviewPanel } from "./_components/overview-panel";
import { PortfolioPanel } from "./_components/portfolio-panel";

export default function DashboardPage() {
  return (
    <div className="h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <DashboardHeader />
      <main className="px-6 pb-6">
        <div className="grid h-[calc(100vh-64px-24px)] grid-cols-1 gap-4 overflow-hidden md:grid-cols-12 md:grid-rows-6">
          <OverviewPanel className="col-span-12 row-span-1 md:col-span-4 md:row-span-2" />
          <MomentumPanel className="col-span-12 row-span-1 md:col-span-4 md:row-span-2" />
          <PortfolioPanel className="col-span-12 row-span-1 md:col-span-4 md:row-span-2" />
          <MarketHighlightsPanel className="col-span-12 row-span-1 md:col-span-8 md:row-span-4" />
          <ActivityFeedPanel className="col-span-12 row-span-1 md:col-span-4 md:row-span-4" />
        </div>
      </main>
    </div>
  );
}
