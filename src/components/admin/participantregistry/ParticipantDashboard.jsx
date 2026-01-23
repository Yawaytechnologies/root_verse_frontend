// src/components/admin/participantRegistry/ParticipantRegistryDashboard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiShield,
  FiTruck,
  FiBox,
  FiClock,
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

export default function ParticipantRegistryDashboard() {
  const stats = useMemo(
    () => [
      {
        label: "Registered Participants",
        value: "248",
        helper: "PCCs, processors, transport, cold stores",
        icon: FiUsers,
        tone: "dark",
      },
      {
        label: "Active PCCs",
        value: "34",
        helper: "Operational today",
        icon: FiShield,
        tone: "emerald",
      },
      {
        label: "Transport Providers",
        value: "58",
        helper: "Verified fleet partners",
        icon: FiTruck,
        tone: "amber",
      },
      {
        label: "Cold Stores",
        value: "19",
        helper: "Storage capacity tracked",
        icon: FiBox,
        tone: "slate",
      },
    ],
    []
  );

  const recent = useMemo(
    () => [
      {
        id: 1,
        name: "Nagapattinam PCC — East Dock",
        type: "PCC",
        status: "Active",
        createdAt: "23/01/2026, 10:25",
      },
      {
        id: 2,
        name: "Blue Lantern Processing Unit",
        type: "Processor",
        status: "Pending",
        createdAt: "23/01/2026, 09:40",
      },
      {
        id: 3,
        name: "Chennai Cold Storage — Bay 2",
        type: "Cold Store",
        status: "Active",
        createdAt: "22/01/2026, 18:12",
      },
      {
        id: 4,
        name: "SeaPearl Logistics",
        type: "Transport",
        status: "Inactive",
        createdAt: "22/01/2026, 14:05",
      },
    ],
    []
  );

  const health = useMemo(
    () => [
      { label: "Pending approvals", value: "7", icon: FiClock },
      { label: "Active entities", value: "211", icon: FiCheckCircle },
      { label: "Sync status", value: "Healthy", icon: FiActivity },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-slate-900/5 blur-3xl" />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200 shadow-sm">
                Participant Registry • Dashboard
              </div>
              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Participant Overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Dummy dashboard UI (replace counts with APIs later).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/admin/participant-registry/quality-checker"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(15,23,42,0.22)] hover:bg-black"
              >
                Go to Quality Checker
                <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 grid gap-4 lg:grid-cols-12">
        {/* Recent */}
        <section className="lg:col-span-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-sm font-extrabold text-slate-900">Recent registrations</div>
            <div className="mt-1 text-xs text-slate-500">
              Latest entities added to Participant Registry
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {recent.map((r) => (
              <div key={r.id} className="px-5 py-4 hover:bg-slate-50">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">
                      {r.name}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700">
                        {r.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        {r.createdAt}
                      </span>
                    </div>
                  </div>

                  <StatusPill status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System / quick panel */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="text-sm font-extrabold text-slate-900">Registry health</div>
              <div className="mt-1 text-xs text-slate-500">Dummy status panel</div>
            </div>

            <div className="p-5 space-y-3">
              {health.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <h.icon className="h-4 w-4 text-slate-500" />
                    {h.label}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{h.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="text-sm font-extrabold text-slate-900">Quick actions</div>
              <div className="mt-1 text-xs text-slate-500">Shortcuts (dummy)</div>
            </div>

            <div className="p-5 grid gap-2">
              <Link
                to="/admin/participant-registry/quality-checker"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Quality Checker Registry
                <FiArrowRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                type="button"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 cursor-not-allowed"
                title="Dummy"
              >
                Add PCC (coming)
                <FiArrowRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 cursor-not-allowed"
                title="Dummy"
              >
                Add Processor (coming)
                <FiArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, tone }) {
  const toneClasses =
    tone === "dark"
      ? "bg-slate-900 text-white"
      : tone === "emerald"
      ? "bg-emerald-600 text-white"
      : tone === "amber"
      ? "bg-amber-600 text-white"
      : "bg-slate-700 text-white";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-2xl ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 truncate">
            {label}
          </div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{value}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-500">{helper}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : s === "pending"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${cls}`}>
      {status || "—"}
    </span>
  );
}
