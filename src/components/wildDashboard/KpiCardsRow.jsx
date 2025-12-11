// src/components/dashboard/KpiCardsRow.jsx
import React from "react";
import { kpiStats } from "../../data/wildCaptureMock";

export default function KpiCardsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      {kpiStats.map((kpi) => {
        const isUp = kpi.deltaType === "up";
        return (
          <div
            key={kpi.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex flex-col gap-2"
          >
            <p className="text-xs text-slate-500">{kpi.label}</p>
            <p className="text-lg font-semibold">{kpi.value}</p>
            <div className="flex items-center justify-between mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isUp
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <span className="mr-1">{isUp ? "▲" : "▼"}</span>
                {kpi.delta}
              </span>
              <span className="text-[11px] text-slate-400">{kpi.helper}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
