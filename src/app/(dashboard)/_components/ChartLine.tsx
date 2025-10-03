"use client";

import type { ReactElement } from "react";
import { useId } from "react";
import type { TooltipProps } from "recharts";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartLineProps<T extends Record<string, number | string>> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  tooltip?: ReactElement | ((props: TooltipProps<number, string>) => ReactElement | null);
  yAxisFormatter?: (value: number) => string;
}

export function ChartLine<T extends Record<string, number | string>>({
  data,
  xKey,
  yKey,
  tooltip,
  yAxisFormatter,
}: ChartLineProps<T>) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--tertiary)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.25} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--panel-2)" strokeOpacity={0.5} strokeDasharray="3 8" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} dy={4} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          width={36}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip content={tooltip} cursor={{ stroke: "var(--tertiary)", strokeOpacity: 0.24, strokeWidth: 2 }} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={`url(#${gradientId})`}
          strokeWidth={2.4}
          dot={false}
          activeDot={{ r: 4, fill: "var(--primary)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
