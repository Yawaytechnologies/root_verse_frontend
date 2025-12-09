import React from "react";
import {
  FiMapPin,
  FiPlus,
} from "react-icons/fi";

import FiltersBar from "../../components/mariculture/FiltersBar";
import StatsRow from "../../components/mariculture/StatsRow";
import CoastalOverview from "../../components/mariculture/CoastalOverview";
import UnitsTable from "../../components/mariculture/UnitsTable";
import TodayActions from "../../components/mariculture/TodayActions";
import RecentActivity from "../../components/mariculture/RecentActivity";

const dummyUnits = [
  {
    id: "RV-MF-RA-000312-001",
    name: "Raft 01",
    farmName: "Ramanathapuram SHG Cluster",
    species: "Kappaphycus alvarezii",
    growth: "28 days",
    status: "Healthy",
    lastCheck: "Today · 07:30 AM",
  },
  {
    id: "RV-MF-RA-000312-002",
    name: "Raft 02",
    farmName: "Ramanathapuram SHG Cluster",
    species: "Kappaphycus alvarezii",
    growth: "34 days",
    status: "Harvest due",
    lastCheck: "Yesterday · 05:10 PM",
  },
  {
    id: "RV-MF-RA-000401-001",
    name: "Line 01",
    farmName: "Palk Bay Producers Group",
    species: "Kappaphycus alvarezii",
    growth: "19 days",
    status: "Attention",
    lastCheck: "2 days ago",
  },
];

const recentActivity = [
  {
    type: "harvest",
    title: "Harvest created – MH-2025-11-001",
    unit: "Raft 02 · RV-MF-RA-000312-002",
    time: "Today · 09:05 AM",
  },
  {
    type: "water",
    title: "Water quality log submitted",
    unit: "Line 01 · RV-MF-RA-000401-001",
    time: "Today · 08:10 AM",
  },
  {
    type: "growth",
    title: "Growth check completed",
    unit: "Raft 01 · RV-MF-RA-000312-001",
    time: "Yesterday · 06:40 PM",
  },
];

export default function MaricultureDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80">
              ROOTVERSE · MARICULTURE
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
              Seaweed Farm Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Monitor rafts, water health, and harvest batches in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800/60 transition">
              <FiMapPin className="text-sm" />
              Map view
            </button>
            <button className="inline-flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium shadow-lg shadow-emerald-500/20 transition">
              <FiPlus className="text-sm" />
              New harvest
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <FiltersBar />

        <StatsRow />

        <section className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <CoastalOverview />
            <UnitsTable units={dummyUnits} />
          </div>

          <div className="space-y-6">
            <TodayActions />
            <RecentActivity items={recentActivity} />
          </div>
        </section>
      </main>
    </div>
  );
}
