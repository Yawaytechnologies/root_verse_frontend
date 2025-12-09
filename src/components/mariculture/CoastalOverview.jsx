import React from "react";

export default function CoastalOverview() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            Coastal overview
          </h2>
          <p className="text-xs text-slate-400">
            Active mariculture clusters along the coast.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-slate-500">
            Updated · 2 min ago
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-slate-900 text-emerald-300 border border-emerald-500/40 uppercase tracking-[0.16em]">
            Live view
          </span>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mb-3">
        <LegendDot className="bg-emerald-400" label="Healthy clusters" />
        <LegendDot className="bg-amber-400" label="Attention needed" />
        <LegendDot className="bg-slate-500" label="No recent data" />
      </div>

      {/* Simple map-style box */}
      <div className="mt-1 h-52 sm:h-64 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-[linear-gradient(to_right,rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        {/* Markers – dummy static positions for now */}
        <MapMarker
          label="Ramanathapuram cluster"
          status="healthy"
          style={{ top: "30%", left: "32%" }}
        />
        <MapMarker
          label="Palk Bay – Line units"
          status="attention"
          style={{ top: "55%", left: "60%" }}
        />
        <MapMarker
          label="Pilot site"
          status="idle"
          style={{ top: "40%", left: "78%" }}
        />

        {/* Footer label */}
        <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-700/60">
          Bay of Bengal · Tamil Nadu Coast
        </div>
      </div>
    </div>
  );
}

/* ---------- Small sub-components ---------- */

function LegendDot({ className = "", label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${className}`}
      />
      <span>{label}</span>
    </span>
  );
}

function MapMarker({ label, status, style }) {
  let colorClass = "bg-emerald-400 border-emerald-300";
  if (status === "attention") {
    colorClass = "bg-amber-400 border-amber-300";
  } else if (status === "idle") {
    colorClass = "bg-slate-400 border-slate-300";
  }

  return (
    <div
      className="absolute flex flex-col items-center"
      style={style}
    >
      <div
        className={
          "w-2.5 h-2.5 rounded-full border shadow-[0_0_12px_rgba(16,185,129,0.5)] " +
          colorClass
        }
      />
      <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700/70 text-[10px] text-slate-200 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
