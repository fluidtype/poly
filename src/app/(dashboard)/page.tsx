import { ActivityFeedPanel } from "./_components/activity-feed-panel";
import { CreditDonutPanel } from "./_components/credit-donut-panel";
import { DashboardHeader } from "./_components/dashboard-header";
import { Highlights } from "./_components/Highlights";
import { MomentumPanel } from "./_components/momentum-panel";
import { OverviewPanel } from "./_components/overview-panel";
import { PortfolioPanel } from "./_components/portfolio-panel";
import { PrimaryChartPanel } from "./_components/primary-chart-panel";
import { Signals } from "./_components/Signals";
import { Topbar } from "./_components/Topbar";

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 overflow-auto px-4 pb-6 pt-4 lg:overflow-hidden xl:px-6">
        <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-4 lg:h-[calc(100vh-64px-24px)] lg:overflow-hidden">
          <Topbar className="flex-shrink-0" />
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-visible lg:grid-cols-12 lg:grid-rows-[repeat(7,minmax(0,1fr))] lg:gap-3 xl:gap-4">
            <PrimaryChartPanel className="col-span-12 h-full lg:col-span-8 lg:row-span-3 xl:col-span-8 xl:row-span-3" />
            <OverviewPanel className="col-span-12 h-full lg:col-span-4 lg:row-span-2 xl:row-span-3" />
            <ActivityFeedPanel className="col-span-12 h-full lg:col-span-4 lg:row-span-2" />
            <CreditDonutPanel className="col-span-12 h-full lg:col-span-4 lg:row-span-2" />
            <PortfolioPanel className="col-span-12 h-full lg:col-span-4 lg:row-span-2" />
            <Highlights className="col-span-12 h-full lg:col-span-4 lg:row-span-2" />
            <MomentumPanel className="col-span-12 h-full lg:col-span-4 lg:row-span-2" />
            <Signals className="col-span-12 h-full lg:col-span-4 lg:row-span-2" />
          </div>
        </div>
      </main>
    </div>
  );
}
