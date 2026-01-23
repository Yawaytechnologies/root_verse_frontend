// src/components/dashboard/CatchTrendChart.jsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { catchTrendData } from "../../data/wildCaptureMock";

export default function CatchTrendChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Catch Volume Trend
          </p>
          <p className="text-[11px] text-slate-500">
            Growth of verified landings (kg)
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] bg-slate-100 rounded-full px-2 py-1">
          <button className="px-2 py-0.5 rounded-full bg-white shadow text-slate-700">
            6 months
          </button>
          <button className="px-2 py-0.5 rounded-full text-slate-500">
            1 year
          </button>
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={catchTrendData} margin={{ left: -20, right: 0 }}>
            <defs>
              <linearGradient id="catchGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
              formatter={(value) => [`${value.toLocaleString()} kg`, "Weight"]}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#catchGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
