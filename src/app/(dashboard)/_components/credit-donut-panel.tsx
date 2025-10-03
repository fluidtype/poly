"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { Panel } from "./panel";

const credit = [
  { name: "Utilised", value: 62, color: "var(--primary)" },
  { name: "Strategic buffer", value: 24, color: "var(--tertiary)" },
  { name: "Available", value: 14, color: "var(--panel-2)" },
];

export function CreditDonutPanel({ className }: { className?: string }) {
  return (
    <Panel
      className={className}
      subtitle="Credit"
      title="Line of capital"
      headerAction={
        <span className="rounded-full border border-white/10 bg-[var(--panel-2)]/70 px-3 py-1 text-xs text-[var(--muted)]">
          Limit $26M
        </span>
      }
    >
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={credit}
                dataKey="value"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={6}
                strokeWidth={0}
              >
                {credit.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--fg)"
                fontSize={18}
                fontWeight={600}
              >
                76%
              </text>
              <text
                x="50%"
                y="62%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--muted)"
                fontSize={11}
              >
                Utilised
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-xs text-[var(--muted)]">
          {credit.map((item) => (
            <li key={item.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-white/10"
                  style={{ background: item.color }}
                />
                {item.name}
              </span>
              <span className="text-[var(--fg)]">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
