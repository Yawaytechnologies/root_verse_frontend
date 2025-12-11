// src/components/dashboard/TripGoalChart.jsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { tripGoal } from "../../data/wildCaptureMock";

export default function TripGoalChart() {
  const completionPct = Math.round(
    (tripGoal.completedTrips / tripGoal.goalTrips) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Trip Goal</p>
          <p className="text-[11px] text-slate-500">
            {tripGoal.completedTrips} / {tripGoal.goalTrips} trips completed
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] bg-slate-100 rounded-full px-2 py-1">
          <button className="px-2 py-0.5 rounded-full bg-white shadow text-slate-700">
            Weekly
          </button>
          <button className="px-2 py-0.5 rounded-full text-slate-500">
            Monthly
          </button>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xl font-semibold text-emerald-600">
          +{completionPct}%
        </span>
        <span className="text-[11px] text-slate-500">
          Target completion vs start of season
        </span>
      </div>
      <div className="h-40 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={tripGoal.weeklySeries} margin={{ left: -20, right: 0 }}>
            <defs>
              <linearGradient id="tripGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
              formatter={(value) => [`${value} trips`, "Trips"]}
            />
            <Area
              type="monotone"
              dataKey="trips"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#tripGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
