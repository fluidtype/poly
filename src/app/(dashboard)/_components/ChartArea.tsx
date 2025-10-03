"use client";

import type { ReactElement } from "react";
import { useId } from "react";
import type { TooltipProps } from "recharts";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartAreaProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T & string;
  areaKey: keyof T & string;
  barKey?: keyof T & string;
  tooltip?: ReactElement | ((props: TooltipProps<number, string>) => ReactElement | null);
  yAxisFormatter?: (value: number) => string;
  cursorColor?: string;
  barSize?: number;
}

export function ChartArea<T extends Record<string, number | string>>({
  data,
  xKey,
  areaKey,
  barKey,
  tooltip,
  yAxisFormatter,
  cursorColor = "var(--primary)",
  barSize = 16,
}: ChartAreaProps<T>) {
  const areaGradientId = useId().replace(/:/g, "");
  const barGradientId = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.85} />
            <stop offset="95%" stopColor="var(--tertiary)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id={barGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--tertiary)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--panel-2)" strokeOpacity={0.6} strokeDasharray="3 8" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} dy={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted)", fontSize: 12 }}
          width={48}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip content={tooltip} cursor={{ stroke: cursorColor, strokeOpacity: 0.18, strokeWidth: 2 }} />
        {barKey ? (
          <Bar dataKey={barKey} barSize={barSize} radius={6} fill={`url(#${barGradientId})`} />
        ) : null}
        <Area
          type="monotone"
          dataKey={areaKey}
          stroke="var(--primary)"
          strokeWidth={2.4}
          fill={`url(#${areaGradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: "var(--primary)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
