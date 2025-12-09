import React from "react";
import {
  FiMapPin,
  FiTrendingUp,
  FiDroplet,
  FiAlertTriangle,
} from "react-icons/fi";

function StatCard({ title, value, sub, icon, tone = "default" }) {
  const toneClasses =
    tone === "alert"
      ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
      : "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          {title}
        </p>
        <div
          className={
            "inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm " +
            toneClasses
          }
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-lg sm:text-xl font-semibold text-slate-50">
          {value}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function StatsRow() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Active marine farms"
        value="18"
        sub="6 districts"
        icon={<FiMapPin />}
      />
      <StatCard
        title="Cultivation units"
        value="124"
        sub="Rafts & long-lines"
        icon={<FiTrendingUp />}
      />
      <StatCard
        title="Avg. growth rate"
        value="4.6 cm/day"
        sub="Last 7 days"
        icon={<FiDroplet />}
      />
      <StatCard
        title="Units needing attention"
        value="5"
        sub="High temp / low DO"
        icon={<FiAlertTriangle />}
        tone="alert"
      />
    </section>
  );
}
