// src/components/dashboard/InfoCardsRow.jsx
import React from "react";
import {
  faoZones,
  gearBreakdown,
  tempQC,
} from "../../data/wildCaptureMock";

export default function InfoCardsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* FAO zones */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-800 mb-1">
          FAO Zones Covered
        </p>
        <p className="text-[11px] text-slate-500 mb-3">
          Zones with active trips this month
        </p>
        <div className="flex flex-wrap gap-2">
          {faoZones.map((zone) => (
            <span
              key={zone}
              className="px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-600"
            >
              Zone {zone}
            </span>
          ))}
        </div>
      </div>

      {/* Gear breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-800 mb-1">
          Active Gear Types
        </p>
        <p className="text-[11px] text-slate-500 mb-3">
          Share of trips by fishing method
        </p>
        <div className="space-y-2">
          {gearBreakdown.map((gear) => (
            <div key={gear.name}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-600">{gear.name}</span>
                <span className="text-slate-500">{gear.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${gear.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Temperature QC */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-800 mb-1">
          Avg Landing Temperature
        </p>
        <p className="text-[11px] text-slate-500 mb-4">
          Measured at harbor for last 7 days
        </p>
        <p className="text-2xl font-semibold text-slate-900">
          {tempQC.avgTemp}
          <span className="text-base text-slate-500">°C</span>
        </p>
        <p className="mt-1 text-[11px] text-emerald-600 font-medium">
          {tempQC.status}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">{tempQC.delta}</p>
      </div>
    </div>
  );
}
