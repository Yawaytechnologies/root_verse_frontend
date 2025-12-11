// src/components/dashboard/ComplianceGauge.jsx
import React from "react";
import { complianceScore } from "../../data/wildCaptureMock";

export default function ComplianceGauge() {
  const pct = complianceScore.score;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Compliance Score
          </p>
          <p className="text-[11px] text-slate-500">Month</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {/* Semi-circle gauge using gradients */}
        <div className="relative w-40 h-20 overflow-hidden">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
          <div className="absolute inset-[10px] rounded-full bg-white" />
          {/* Needle indicator */}
          <div
            className="absolute bottom-0 left-1/2 origin-bottom h-16 w-0.5 bg-slate-800"
            style={{ transform: `rotate(${(pct / 100) * 180 - 90}deg)` }}
          />
        </div>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {pct}
          <span className="text-base text-slate-500">%</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-500 text-center max-w-xs">
          {complianceScore.label}
        </p>
      </div>
    </div>
  );
}
