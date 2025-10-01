import SearchBar from "./SearchBar";

export default function TopBar() {
  return (
    <div className="sticky top-[var(--header-h)] z-40 bg-[color:var(--surface)]/90 backdrop-blur-md border-b border-[color:var(--border)]/60">
      <div className="mx-auto w-full max-w-[1440px] px-5">
        <div className="flex flex-col items-center py-3 md:py-4">
          <SearchBar />
          <div className="pointer-events-none mt-1 h-[2px] w-full max-w-[760px] rounded-full bg-gradient-to-r from-[color:var(--primary)]/50 via-transparent to-[color:var(--primary)]/30" />
        </div>
      </div>
    </div>
  );
}
