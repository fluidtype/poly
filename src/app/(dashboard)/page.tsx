import { ActivityFeedPanel } from "./_components/activity-feed-panel";
import { CreditDonutPanel } from "./_components/credit-donut-panel";
import { DashboardHeader } from "./_components/dashboard-header";
import { MarketHighlightsPanel } from "./_components/market-highlights-panel";
import { MomentumPanel } from "./_components/momentum-panel";
import { OverviewPanel } from "./_components/overview-panel";
import { PortfolioPanel } from "./_components/portfolio-panel";
import { PrimaryChartPanel } from "./_components/primary-chart-panel";
import { SignalsPanel } from "./_components/signals-panel";
import { Topbar } from "./_components/topbar";

export default function DashboardPage() {
  return (
    <div className="h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <DashboardHeader />
      <main className="px-6 pb-6 pt-4">
        <div className="flex h-[calc(100vh-64px-24px)] flex-col gap-4 overflow-hidden">
          <Topbar className="flex-shrink-0" />
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden md:grid-cols-12 md:grid-rows-[repeat(7,minmax(0,1fr))]">
            <PrimaryChartPanel className="col-span-12 row-span-2 h-full md:col-span-8 md:row-span-3" />
            <OverviewPanel className="col-span-12 row-span-1 h-full md:col-span-4 md:row-span-3" />
            <ActivityFeedPanel className="col-span-12 row-span-1 h-full md:col-span-4 md:row-span-2" />
            <CreditDonutPanel className="col-span-12 row-span-1 h-full md:col-span-4 md:row-span-2" />
            <PortfolioPanel className="col-span-12 row-span-1 h-full md:col-span-4 md:row-span-2" />
            <MarketHighlightsPanel className="col-span-12 row-span-1 h-full md:col-span-4 md:row-span-2" />
            <MomentumPanel className="col-span-12 row-span-1 h-full md:col-span-4 md:row-span-2" />
            <SignalsPanel className="col-span-12 row-span-1 h-full md:col-span-4 md:row-span-2" />
          </div>
        </div>
      </main>
    </div>
  );
}
