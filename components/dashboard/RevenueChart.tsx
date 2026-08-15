"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

export function RevenueChart({
  data,
  currency,
}: {
  data: Array<{ date: string; revenue: number; units: number }>;
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5C1A34" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#5C1A34" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E4DED4" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => formatDate(value)}
          tick={{ fontSize: 11, fill: "#6B6470" }}
          axisLine={{ stroke: "#E4DED4" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value, currency)}
          tick={{ fontSize: 11, fill: "#6B6470" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value), currency)}
          labelFormatter={(value) => formatDate(String(value))}
          contentStyle={{
            borderColor: "#E4DED4",
            borderRadius: 3,
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#5C1A34"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
