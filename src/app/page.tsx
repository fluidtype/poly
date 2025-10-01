import GdeltPanel from "@/components/dashboard/GdeltPanel";
import PolymarketPanel from "@/components/dashboard/PolymarketPanel";
import SearchStatePanel from "@/components/dashboard/SearchStatePanel";

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
      <PolymarketPanel />
      <GdeltPanel />
      <SearchStatePanel />
    </div>
  );
}
