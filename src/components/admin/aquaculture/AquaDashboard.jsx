// src/modules/admin/aquaculture/pages/AquaCultureDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Dashboard UI (theme-matched to your screenshot)
 * - No extra libraries
 * - Tailwind only
 * - Replace mock data with API later
 */

function fmtNum(v) {
  if (v === null || v === undefined) return "-";
  if (typeof v === "number") return v.toLocaleString();
  return String(v);
}

function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function LayersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3 3 8l9 5 9-5-9-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M3 12l9 5 9-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M3 16l9 5 9-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DropIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2s7 7 7 13a7 7 0 1 1-14 0c0-6 7-13 7-13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 17l6-6 4 4 7-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7h6v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white">
            {icon}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-[0.24em] text-slate-600">
              {label}
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">
              {value}
            </div>
            <div className="mt-2 text-sm text-slate-500">{sub}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ children, icon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 ring-1 ring-black/5">
      {icon ? <span className="text-slate-500">{icon}</span> : null}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}

function CycleRow({ item, isLast }) {
  return (
    <div className={`flex items-center gap-4 py-5 ${isLast ? "" : "border-b border-slate-100"}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
        <DropIcon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold text-slate-900">
          {item.code} · {item.farm} · {item.pond}
        </div>
        <div className="mt-1 truncate text-sm text-slate-500">
          {item.location} · {item.species}
        </div>
      </div>

      <div className="hidden items-center gap-3 lg:flex">
        <Pill>{`Day ${item.day} · ${item.stage}`}</Pill>
        <Pill icon={<ClockIcon className="h-4 w-4" />}>
          {`${item.daysToHarvest} days to harvest`}
        </Pill>
        <div className="text-sm text-slate-600">
          Biomass:{" "}
          <span className="font-semibold text-slate-900">
            {item.biomass}
          </span>{" "}
          <span className="text-slate-500">(est.)</span>
        </div>
      </div>

      {/* Mobile compact meta */}
      <div className="flex flex-col items-end gap-2 lg:hidden">
        <Pill>{`Day ${item.day}`}</Pill>
        <div className="text-xs text-slate-500">{item.stage}</div>
      </div>
    </div>
  );
}

export default function AquaCultureDashboard() {
  // Mock data (replace with API)
  const stats = useMemo(
    () => [
      {
        label: "REGISTERED FARMS",
        value: 34,
        sub: "Across all clusters",
        icon: <LayersIcon className="h-5 w-5" />,
      },
      {
        label: "ACTIVE PONDS",
        value: 112,
        sub: "Stocked this cycle",
        icon: <DropIcon className="h-5 w-5" />,
      },
      {
        label: "LIVE BIOMASS (MT)",
        value: 386.4,
        sub: "Estimated standing crop",
        icon: <TrendIcon className="h-5 w-5" />,
      },
    ],
    [],
  );

  const cycles = useMemo(
    () => [
      {
        id: 1,
        code: "NA-FRM-001",
        farm: "Blue Creek",
        pond: "P01",
        location: "Nagapattinam",
        species: "Shrimp · L. vannamei",
        day: 42,
        stage: "Mid grow-out",
        daysToHarvest: 35,
        biomass: "18.4 MT",
      },
      {
        id: 2,
        code: "NA-FRM-004",
        farm: "Sunrise Aquafarm",
        pond: "P07",
        location: "Tuticorin",
        species: "Tilapia",
        day: 65,
        stage: "Pre-harvest",
        daysToHarvest: 10,
        biomass: "22.1 MT",
      },
      {
        id: 3,
        code: "NA-FRM-009",
        farm: "Green Fields",
        pond: "P03",
        location: "Ramanathapuram",
        species: "Shrimp · L. vannamei",
        day: 18,
        stage: "Early grow-out",
        daysToHarvest: 62,
        biomass: "7.9 MT",
      },
    ],
    [],
  );

  // Local time label (top-right like your screenshot)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const localTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now);
    } catch {
      return now.toLocaleTimeString();
    }
  }, [now]);

  return (
    <div className="min-h-full bg-[#EEF2F7]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Aquaculture Dashboard
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Quick overview of farms, ponds and current culture cycles.
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((s) => (
            <MetricCard
              key={s.label}
              icon={s.icon}
              label={s.label}
              value={fmtNum(s.value)}
              sub={s.sub}
            />
          ))}
        </div>

        {/* Current Pond Cycles */}
        <div className="mt-8 rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-4 px-6 pt-6">
            <div>
              <div className="text-xs font-semibold tracking-[0.24em] text-slate-600">
                CURRENT POND CYCLES
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Key ponds being monitored this week.
              </div>
            </div>

            <div className="text-sm text-slate-500">
              Local time{" "}
              <span className="ml-2 font-semibold text-slate-700">{localTime}</span>
            </div>
          </div>

          <div className="px-6 pb-4">
            {cycles.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-sm font-semibold text-slate-700">
                  No active cycles found
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  Once ponds are stocked, they’ll appear here for monitoring.
                </div>
              </div>
            ) : (
              cycles.map((c, idx) => (
                <CycleRow
                  key={c.id}
                  item={c}
                  isLast={idx === cycles.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}