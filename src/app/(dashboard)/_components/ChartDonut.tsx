"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export interface ChartDonutDatum {
  name: string;
  value: number;
  color: string;
}

interface ChartDonutProps {
  data: ChartDonutDatum[];
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerSubLabel?: string;
}

export function ChartDonut({
  data,
  innerRadius = 56,
  outerRadius = 86,
  centerLabel,
  centerSubLabel,
}: ChartDonutProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={6}
          strokeWidth={0}
        >
          {data.map((item) => (
            <Cell key={item.name} fill={item.color} />
          ))}
        </Pie>
        {centerLabel ? (
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--fg)"
            fontSize={20}
            fontWeight={600}
          >
            {centerLabel}
          </text>
        ) : null}
        {centerSubLabel ? (
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--muted)"
            fontSize={12}
          >
            {centerSubLabel}
          </text>
        ) : null}
      </PieChart>
    </ResponsiveContainer>
  );
}
