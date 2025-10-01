import SearchBar from "./SearchBar";

export default function TopBar() {
  return (
    <div
      className="sticky top-[var(--header-h)] z-40 border-b border-[color:var(--border)]/60 bg-[color:var(--surface)]/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="relative">
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-[color:var(--primary)]/35 via-transparent to-[color:var(--primary)]/35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(224,36,36,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-4">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
