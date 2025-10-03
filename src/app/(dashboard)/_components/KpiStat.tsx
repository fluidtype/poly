import { cn } from "@/lib/utils";

interface KpiStatProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "neutral" | "positive" | "negative";
  className?: string;
}

const toneMap: Record<NonNullable<KpiStatProps["deltaTone"]>, string> = {
  neutral: "text-[var(--muted)]",
  positive: "text-[var(--primary)]",
  negative: "text-[var(--tertiary)]",
};

export function KpiStat({ label, value, delta, deltaTone = "neutral", className }: KpiStatProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium tracking-wide text-[var(--muted)]">{label}</p>
      <p className="text-3xl font-semibold text-[var(--fg)] md:text-4xl">{value}</p>
      {delta ? <p className={cn("text-sm", toneMap[deltaTone])}>{delta}</p> : null}
    </div>
  );
}
