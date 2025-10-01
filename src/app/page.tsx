export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Welcome
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-text">
          Build delightful dashboards faster
        </h1>
        <p className="max-w-2xl text-base text-muted">
          This starter kit bundles Next.js 14, Tailwind CSS, shadcn/ui, React Query, Zustand,
          Framer Motion, and Recharts so you can focus on crafting product experiences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text">Next.js 14</h2>
          <p className="mt-2 text-sm text-muted">
            App Router configured inside <code>src/</code> with a responsive layout scaffold and
            design tokens powered by CSS variables.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text">UI Foundations</h2>
          <p className="mt-2 text-sm text-muted">
            Tailwind CSS, shadcn/ui, and Lucide icons are ready to go with dark surfaces and
            polished defaults.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text">Data & Motion</h2>
          <p className="mt-2 text-sm text-muted">
            React Query, Zustand, Framer Motion, and Recharts ship pre-installed for dynamic
            experiences.
          </p>
        </div>
      </div>
    </section>
  );
}
