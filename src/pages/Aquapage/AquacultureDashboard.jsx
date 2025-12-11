// src/pages/Aquapage/AquacultureDashboard.jsx
import React from "react";
import {
  FiGrid,
  FiDroplet,
  FiActivity,
  FiLayers,
  FiAlertTriangle,
  FiCheckCircle,
  FiTrendingUp,
  FiFeather,
  FiClock,
  FiBarChart2,
  FiRefreshCw,
} from "react-icons/fi";

export default function AquacultureDashboard() {
  const cardClass =
    "rounded-2xl bg-white border border-slate-200 shadow-sm p-3 md:p-3.5";

  const kpiPills = [
    {
      label: "Total Ponds",
      value: "6",
      icon: FiGrid,
      helper: "Active culture units",
    },
    {
      label: "Stocking Today",
      value: "1",
      icon: FiFeather,
      helper: "Seed stocked in last 24h",
    },
    {
      label: "Grow-out Phase",
      value: "4",
      icon: FiLayers,
      helper: "Ponds in grow-out",
    },
    {
      label: "Ready for Harvest",
      value: "1",
      icon: FiActivity,
      helper: "Harvest ≤ 7 days",
    },
  ];

  const summaryStats = [
    {
      title: "Estimated Biomass",
      value: "12.4 Tons",
      description: "Total biomass across grow-out ponds",
      icon: FiTrendingUp,
      color: "text-emerald-600",
      accent: "border-l-4 border-emerald-300",
    },
    {
      title: "Average FCR",
      value: "1.48",
      description: "Feed Conversion Ratio (farm-wide)",
      icon: FiBarChart2,
      color: "text-sky-600",
      accent: "border-l-4 border-sky-300",
    },
    {
      title: "Avg Daily Feed",
      value: "286 kg",
      description: "Feed used in last 24 hours",
      icon: FiDroplet,
      color: "text-cyan-600",
      accent: "border-l-4 border-cyan-300",
    },
  ];

  const todaysTasks = [
    {
      pond: "Pond A",
      desc: "Morning water quality log pending",
      action: "Record",
    },
    {
      pond: "Pond D",
      desc: "Feed (2nd cycle) due in 1 hour",
      action: "Add Feed",
    },
    {
      pond: "Pond C",
      desc: "Mortality review required",
      action: "Review",
    },
    {
      pond: "Pond F",
      desc: "Pre-harvest sampling scheduled",
      action: "Start Sampling",
    },
  ];

  const recentActivity = [
    "Pond B – Feed added (18.5 kg) – 09:10 AM",
    "Pond A – Water log updated – pH 7.7, DO 5.8 – 08:30 AM",
    "Pond D – Biomass sampling recorded – Yesterday",
    "Harvest batch AH-2025-11-001 created – Linked to Pond D",
  ];

  const pondSnapshot = [
    {
      label: "Stocking",
      value: 3,
      info: "Seed stocked in last 10 days",
      color: "text-amber-600",
    },
    {
      label: "Grow-out",
      value: 2,
      info: "Weekly water checks stable",
      color: "text-sky-600",
    },
    {
      label: "Harvest Ready",
      value: 1,
      info: "Pre-harvest sampling done",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-5">
      {/* TOP: OVERVIEW + TODAY SNAPSHOT */}
      <section className="grid gap-3 md:gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        {/* Overview – now plain white card, no gradient */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Aquaculture · Farm Overview
              </p>
              <h1 className="text-lg md:text-xl font-semibold text-slate-900">
                Culture status at a glance
              </h1>
              <p className="text-[11px] md:text-[12px] text-slate-600 mt-1 max-w-md leading-snug">
                See ponds in stocking, grow-out and harvest-ready stages with
                quick cues for today&apos;s operations.
              </p>
            </div>
            <div className="hidden md:flex h-10 w-10 rounded-full bg-slate-50 border border-slate-200 items-center justify-center">
              <FiGrid className="text-sky-600 text-lg" />
            </div>
          </div>

          {/* KPI pills inside the card – neutral style */}
          <div className="grid gap-2 md:gap-3 sm:grid-cols-2">
            {kpiPills.map(({ label, value, icon: Icon, helper }) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-[11px] text-slate-600">{label}</p>
                  <p className="text-lg font-semibold leading-tight text-slate-900">
                    {value}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {helper}
                  </p>
                </div>
                <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <Icon className="text-sky-600 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today at a glance – timeline style */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <FiClock className="text-sky-600 text-sm" />
              <h2 className="text-[13px] font-semibold text-slate-900">
                Today at a glance
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              Farm operations
            </span>
          </div>

          <ol className="space-y-2 text-[12px] relative pl-3">
            {/* vertical line */}
            <span className="absolute left-1 top-1 bottom-1 w-px bg-slate-200" />
            {todaysTasks.map(({ pond, desc, action }) => (
              <li key={pond} className="relative pl-3">
                {/* dot */}
                <span className="absolute left-[-3px] top-1 h-2 w-2 rounded-full bg-sky-500 shadow-sm" />
                <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200/80">
                  <div>
                    <p className="font-medium text-slate-900">{pond}</p>
                    <p className="text-[11px] text-slate-600">{desc}</p>
                  </div>
                  <button className="text-[11px] rounded-md border border-sky-400 px-2.5 py-1 text-sky-700 hover:bg-sky-50 whitespace-nowrap">
                    {action}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* MIDDLE: BIOMASS / FEED SUMMARY – accent cards */}
      <section className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryStats.map(
          ({ title, value, description, icon: Icon, color, accent }) => (
            <div
              key={title}
              className={`${cardClass} ${accent} flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="h-7 w-7 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Icon className={`text-sm ${color}`} />
                </div>
                <h2 className="text-[13px] font-semibold text-slate-900">
                  {title}
                </h2>
              </div>

              <p className="text-xl font-bold text-slate-900 leading-tight">
                {value}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                {description}
              </p>
            </div>
          )
        )}
      </section>

      {/* BOTTOM: SNAPSHOT + ALERTS + TRACEABILITY */}
      <section className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Pond Snapshot */}
        <div className={cardClass}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <FiTrendingUp className="text-sky-600 text-sm" />
            <h2 className="text-[13px] font-semibold text-slate-900">
              Pond Snapshot
            </h2>
          </div>

          <div className="space-y-1.5 text-[12px]">
            {pondSnapshot.map(({ label, value, info, color }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-200"
              >
                <p className="text-slate-900">
                  <span className={`${color} font-semibold`}>{value}</span>{" "}
                  {label}
                </p>
                <p className="text-[10px] text-slate-600 text-right max-w-[55%] leading-snug">
                  {info}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Warnings */}
        <div className={cardClass}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <FiAlertTriangle className="text-amber-600 text-sm" />
            <h2 className="text-[13px] font-semibold text-slate-900">
              Alerts & Warnings
            </h2>
          </div>

          <ul className="space-y-1.5 text-[12px]">
            <li className="flex gap-2 rounded-xl bg-amber-50/80 px-3 py-2 border border-amber-100">
              <FiAlertTriangle className="text-amber-600 mt-[2px] text-[13px]" />
              <div>
                <p className="text-slate-900 text-[12px] leading-snug">
                  Low DO trend in{" "}
                  <span className="font-semibold">Pond A</span>
                </p>
                <p className="text-[10px] text-slate-700">
                  Last 3 readings below 5.5 mg/L
                </p>
              </div>
            </li>

            <li className="flex gap-2 rounded-xl bg-amber-50/80 px-3 py-2 border border-amber-100">
              <FiAlertTriangle className="text-amber-600 mt-[2px] text-[13px]" />
              <div>
                <p className="text-slate-900 text-[12px] leading-snug">
                  Feed irregularity in{" "}
                  <span className="font-semibold">Pond C</span>
                </p>
                <p className="text-[10px] text-slate-700">
                  2 missed logs in last 48 hours
                </p>
              </div>
            </li>

            <li className="flex gap-2 rounded-xl bg-emerald-50 px-3 py-2 border border-emerald-100">
              <FiCheckCircle className="text-emerald-600 mt-[2px] text-[13px]" />
              <div>
                <p className="text-slate-900 text-[12px] leading-snug">
                  Farm logs complete – Batch{" "}
                  <span className="font-semibold">AH-2025-11-001</span>
                </p>
                <p className="text-[10px] text-slate-700">
                  Seed, feed, water & health logs ready for harvest.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Traceability Readiness */}
        <div className={cardClass}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <FiRefreshCw className="text-sky-600 text-sm" />
            <h2 className="text-[13px] font-semibold text-slate-900">
              Traceability Readiness
            </h2>
          </div>

          <ul className="space-y-1.5 text-[12px]">
            <li className="flex justify-between items-center rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
              <span className="text-slate-800">
                Active batches with full logs
              </span>
              <span className="text-sky-700 font-semibold">4</span>
            </li>
            <li className="flex justify-between items-center rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
              <span className="text-slate-800">Last harvest batch</span>
              <span className="text-emerald-700 text-[12px]">
                AH-2025-11-001
              </span>
            </li>
            <li className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-800">Sync status</span>
                <span className="text-[10px] text-slate-600 text-right">
                  Shared with plant / buyer
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-emerald-700 font-medium">
                Farm-side data up to date
              </p>
            </li>
          </ul>

          <div className="mt-3 border-t border-slate-200 pt-2.5">
            <p className="text-[11px] font-semibold text-slate-700 mb-1">
              Recent activity
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-700">
              {recentActivity.map((text, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
