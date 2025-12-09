import React from "react";
import { FiTrendingUp, FiDroplet, FiPlus } from "react-icons/fi";

function ActionButton({ title, description, icon, primary = false }) {
  const base =
    "w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left text-xs border transition";
  const primaryClasses =
    " bg-emerald-500 text-slate-950 border-emerald-400 hover:bg-emerald-400";
  const secondaryClasses =
    " bg-slate-950/80 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900";

  return (
    <button className={base + (primary ? primaryClasses : secondaryClasses)}>
      <div className="mt-0.5">
        <div
          className={
            "inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm " +
            (primary
              ? "bg-slate-950/10"
              : "bg-slate-900 border border-slate-700 text-emerald-300")
          }
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className={
            "font-medium " + (primary ? "text-slate-950" : "text-slate-50")
          }
        >
          {title}
        </p>
        <p
          className={
            "mt-0.5 text-[11px] " +
            (primary ? "text-slate-900/80" : "text-slate-400")
          }
        >
          {description}
        </p>
      </div>
    </button>
  );
}

export default function TodayActions() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-50">Today&apos;s actions</h2>
      <p className="text-xs text-slate-400 mt-1 mb-3">
        Capture the minimum logs needed for traceability compliance.
      </p>

      <div className="space-y-3">
        <ActionButton
          title="Log growth & health"
          description="Height samples, color, epiphytes, physical damage."
          icon={<FiTrendingUp />}
        />
        <ActionButton
          title="Log water quality"
          description="Temperature, salinity, DO, pH, turbidity."
          icon={<FiDroplet />}
        />
        <ActionButton
          title="Create harvest batch"
          description="Generate MH-IDs, link rafts, and assign crates."
          icon={<FiPlus />}
          primary
        />
      </div>
    </div>
  );
}
