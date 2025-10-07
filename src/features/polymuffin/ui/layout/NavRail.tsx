"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Activity, BarChart2, Twitter } from "lucide-react";

import { useGlobalFilters } from "@/stores/useGlobalFilters";
import { cn } from "@/lib/utils";

const DATASET_ICONS: Record<"gdelt" | "polymuffin" | "twitter", React.ComponentType<{ className?: string }>> = {
  gdelt: Activity,
  polymuffin: BarChart2,
  twitter: Twitter,
};

const DATASET_LABELS: Record<"gdelt" | "polymuffin" | "twitter", string> = {
  gdelt: "GDELT",
  polymuffin: "Polymuffin",
  twitter: "Twitter",
};

export default function NavRail() {
  const datasets = useGlobalFilters((state) => state.datasets);
  const toggleDataset = useGlobalFilters((state) => state.toggleDataset);

  const buttons = useMemo(
    () =>
      (Object.keys(datasets) as Array<keyof typeof datasets>).map((key) => ({
        id: key,
        enabled: datasets[key],
        label: DATASET_LABELS[key],
        Icon: DATASET_ICONS[key],
      })),
    [datasets],
  );

  return (
    <nav className="card-surface card-hover flex h-full flex-col items-center justify-between gap-4 rounded-2xl px-3 py-6">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/polymuffinpng.png"
          alt="Polymuffin logo"
          width={40}
          height={40}
          priority
        />
        <div className="h-px w-8 bg-white/10" />
        <div className="flex flex-col items-center gap-3">
          {buttons.map(({ id, label, Icon, enabled }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleDataset(id)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition hover:border-[color:var(--primary)]/40 hover:text-white hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(11,11,14,0.7)]",
                enabled
                  ? "border-[color:var(--primary)]/50 bg-[color:var(--primary)]/15 text-white shadow-[0_0_8px_rgba(255,59,59,0.15)]"
                  : "",
              )}
              aria-pressed={enabled}
              aria-label={label}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
      <div className="text-center text-[10px] uppercase tracking-[0.3em] text-white/40">
        Toggle datasets
      </div>
    </nav>
  );
}
