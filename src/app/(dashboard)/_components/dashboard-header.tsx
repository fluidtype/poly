import { Fragment } from "react";

const links = [
  { label: "Overview", href: "#" },
  { label: "Markets", href: "#" },
  { label: "Alerts", href: "#" },
];

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[var(--bg)]/90 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[var(--panel-2)]/60 text-lg font-semibold text-[var(--primary)]">
          P
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--muted)]">
            Polymuffin
          </p>
          <h1 className="text-xl font-semibold leading-tight text-white/90">
            Intelligence Dashboard
          </h1>
        </div>
      </div>
      <nav className="hidden items-center gap-3 text-sm font-medium text-[var(--muted)] lg:flex">
        {links.map((item, index) => (
          <Fragment key={item.label}>
            <a
              className="rounded-full border border-transparent px-3 py-1.5 text-[var(--muted)] transition hover:border-white/10 hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-0"
              href={item.href}
            >
              {item.label}
            </a>
            {index < links.length - 1 ? (
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--panel-2)]" />
            ) : null}
          </Fragment>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-4 py-2 text-sm text-[var(--muted)] md:flex">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_0_6px_rgba(255,59,59,0.15)]" />
          Live sync
        </div>
        <input
          aria-label="Search dashboard"
          className="h-10 w-44 rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-4 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-0"
          placeholder="Search"
          type="search"
        />
        <button className="rounded-full border border-white/10 bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--bg)] shadow-[var(--glow)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-0">
          New Report
        </button>
      </div>
    </header>
  );
}
