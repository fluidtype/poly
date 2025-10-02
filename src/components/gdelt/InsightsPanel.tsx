"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { GdeltInsights } from "@/types"

interface InsightsPanelProps {
  insights?: GdeltInsights | null
  isLoading?: boolean
  error?: string | null
}

interface KeywordEntry {
  keyword: string
  count: number
}

interface TemporalEntry {
  label: string
  value: number
}

interface ActorEntry {
  name: string
  count?: number
}

const toKeywordEntries = (matches?: Record<string, number>): KeywordEntry[] => {
  if (!matches) return []

  return Object.entries(matches)
    .map(([keyword, count]) => ({ keyword, count }))
    .filter((entry) => Number.isFinite(entry.count))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

const toTemporalEntries = (insights?: GdeltInsights): TemporalEntry[] => {
  const raw = insights?.temporal_distribution ?? insights?.timeline ?? []

  if (!Array.isArray(raw) || raw.length === 0) {
    return []
  }

  return raw
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>
        const label = typeof record.date === "string" ? record.date : typeof record.label === "string" ? record.label : null
        const valueCandidate = record.count ?? record.value ?? record.total
        const value = typeof valueCandidate === "number" ? valueCandidate : Number(valueCandidate)
        if (label && Number.isFinite(value)) {
          return { label, value }
        }
      }
      return null
    })
    .filter((entry): entry is TemporalEntry => Boolean(entry))
}

const toActorEntries = (insights?: GdeltInsights): ActorEntry[] => {
  const { top_actors, actor_counts } = (insights ?? {}) as Record<string, unknown>

  const raw = Array.isArray(top_actors)
    ? top_actors
    : Array.isArray(actor_counts)
      ? actor_counts
      : typeof top_actors === "object" && top_actors !== null
        ? Object.entries(top_actors as Record<string, number>).map(([name, count]) => ({ name, count }))
        : typeof actor_counts === "object" && actor_counts !== null
          ? Object.entries(actor_counts as Record<string, number>).map(([name, count]) => ({ name, count }))
          : []

  return (raw as unknown[])
    .map((item) => {
      if (typeof item === "string") {
        return { name: item }
      }
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>
        const name =
          typeof record.name === "string"
            ? record.name
            : typeof record.actor === "string"
              ? record.actor
              : typeof record.label === "string"
                ? record.label
                : null
        const countCandidate = record.count ?? record.value ?? record.total
        const count = typeof countCandidate === "number" ? countCandidate : Number(countCandidate)
        if (name) {
          return { name, count: Number.isFinite(count) ? count : undefined }
        }
      }
      return null
    })
    .filter((entry): entry is ActorEntry => Boolean(entry))
    .slice(0, 6)
}

const toSpikeLabels = (insights?: GdeltInsights): string[] => {
  const raw = (insights?.spikes ?? []) as unknown[]
  return raw
    .map((item) => {
      if (typeof item === "string") return item
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>
        if (typeof record.label === "string") return record.label
        if (typeof record.date === "string") return record.date
      }
      return null
    })
    .filter((label): label is string => Boolean(label))
    .slice(0, 3)
}

export function InsightsPanel({ insights, isLoading = false, error }: InsightsPanelProps) {
  const keywords = useMemo(() => toKeywordEntries(insights?.keyword_matches), [insights?.keyword_matches])
  const temporal = useMemo(() => toTemporalEntries(insights ?? undefined), [insights])
  const actors = useMemo(() => toActorEntries(insights ?? undefined), [insights])
  const spikes = useMemo(() => toSpikeLabels(insights ?? undefined), [insights])
  const rawTemporalSource = insights?.temporal_distribution ?? insights?.timeline
  const shouldShowTemporalSection =
    (Array.isArray(temporal) && temporal.length > 0) ||
    spikes.length > 0 ||
    Boolean(rawTemporalSource)

  if (error) {
    return (
      <div className="card compact rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card compact space-y-4 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface-3)] to-[color:var(--surface-2)] p-4">
        <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <div className="h-36 animate-pulse rounded-2xl bg-white/10" />
      </div>
    )
  }

  const isEmpty = keywords.length === 0 && temporal.length === 0 && actors.length === 0 && spikes.length === 0

  if (isEmpty) {
    return (
      <div className="card compact rounded-2xl border border-dashed border-[color:var(--border)]/70 bg-[color:var(--surface-2)]/50 p-4 text-sm text-[color:var(--muted)]">
        No insights available yet. Adjust filters or try a different timeframe.
      </div>
    )
  }

  return (
    <div className="card compact space-y-6 rounded-2xl border border-[color:var(--border)]/60 bg-[color:var(--surface-2)]/60 p-4 shadow-sm shadow-black/5">
      <header>
        <h3 className="text-base font-semibold text-[color:var(--text)]">Insights snapshot</h3>
        <p className="text-xs text-[color:var(--muted)]">Top signals from the current GDELT aggregation.</p>
      </header>

      {keywords.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Top keywords</h4>
          <ul className="mt-3 space-y-2">
            {keywords.map((entry) => (
              <li key={entry.keyword} className="flex items-center justify-between rounded-xl bg-[color:var(--surface-3)]/40 px-3 py-2 text-sm">
                <span className="font-medium text-[color:var(--text)]">{entry.keyword}</span>
                <span className="rounded-full bg-[color:var(--primary)]/15 px-2 py-0.5 text-xs font-semibold text-[color:var(--primary)]">
                  {entry.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shouldShowTemporalSection && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Temporal distribution</h4>
            {spikes.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                {spikes.map((label) => (
                  <span key={label} className="rounded-full bg-red-500/15 px-2 py-0.5 font-semibold text-red-300">
                    ⚠️ {label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="h-40 rounded-2xl bg-[color:var(--surface-3)]/30 p-3">
            {Array.isArray(temporal) && temporal.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={temporal} margin={{ top: 8, left: 0, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="insightsBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} hide={temporal.length > 8} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} width={42} />
                  <Tooltip
                    cursor={{ fill: "rgba(248,113,113,0.1)" }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      background: "var(--surface)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Mentions"]}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="value" fill="url(#insightsBar)" radius={[12, 12, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-[color:var(--muted)]">No data available</p>
            )}
          </div>
        </section>
      )}

      {actors.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">Top actors</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {actors.map((actor) => (
              <span
                key={actor.name}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--primary)]/40 bg-[color:var(--surface-3)]/40 px-3 py-1 text-xs font-medium text-[color:var(--text)]"
              >
                {actor.name}
                {typeof actor.count === "number" && (
                  <span className="rounded-full bg-[color:var(--primary)]/20 px-2 py-0.5 text-[color:var(--primary)]">
                    {actor.count.toLocaleString()}
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default InsightsPanel
