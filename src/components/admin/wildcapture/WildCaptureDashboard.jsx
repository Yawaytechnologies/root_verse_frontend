// src/components/admin/wildcapture/WildCaptureDashboard.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiUsers,
  FiAnchor,
  FiMapPin,
  FiClock,
  FiRefreshCcw,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { fetchWildCaptureDashboard } from "../../../redux/action/dashboardActions";

function isSameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtDT(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

export default function WildCaptureDashboard() {
  const dispatch = useDispatch();
  const {
    loading,
    error,
    ownersTotal,
    vesselsTotal,
    tripsTotal,
    pendingTrips,
    ownersProgress,
    trips = [],
  } = useSelector((s) => s.wilddashboard);

  useEffect(() => {
    dispatch(fetchWildCaptureDashboard());
  }, [dispatch]);

  const todayTrips = useMemo(() => {
    const today = new Date();
    return (Array.isArray(trips) ? trips : [])
      .filter((t) => {
        const planned = t?.planned_at ? new Date(t.planned_at) : null;
        return planned && !Number.isNaN(planned.getTime()) && isSameLocalDay(planned, today);
      })
      .sort((a, b) => new Date(b?.planned_at || 0) - new Date(a?.planned_at || 0))
      .slice(0, 6);
  }, [trips]);

  const verifiedOwners = ownersProgress?.verified ?? null;
  const pendingOwners = ownersProgress?.pending ?? null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-slate-900/5 blur-3xl" />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200 shadow-sm">
                Wild Capture • Overview
              </div>

              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Live totals from Owners, Vessels and Trips.
              </p>

              {(verifiedOwners != null || pendingOwners != null) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {verifiedOwners != null && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                      <FiCheckCircle className="h-4 w-4" />
                      Verified owners: <span className="font-extrabold">{verifiedOwners}</span>
                    </span>
                  )}
                  {pendingOwners != null && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                      Pending owners: <span className="font-extrabold">{pendingOwners}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => dispatch(fetchWildCaptureDashboard())}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              <FiRefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <FiAlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FiUsers}
          label="Owners"
          value={loading ? "…" : ownersTotal}
          helper="Wild capture registrations"
        />
        <StatCard
          icon={FiAnchor}
          label="Vessels"
          value={loading ? "…" : vesselsTotal}
          helper="Registered vessels"
        />
        <StatCard
          icon={FiMapPin}
          label="Trips"
          value={loading ? "…" : tripsTotal}
          helper="Total trips registered"
        />
        <StatCard
          icon={FiClock}
          label="Pending approvals"
          value={loading ? "…" : pendingTrips}
          helper="Trips waiting approval"
          tone="amber"
        />
      </div>

      {/* Today's trips */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-slate-900">Today’s Trips</div>
              <div className="mt-1 text-xs text-slate-500">
                Trips where planned_at is today (local).
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Showing: <span className="text-slate-900">{todayTrips.length}</span>
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">Loading…</div>
          ) : todayTrips.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No trips planned for today.
            </div>
          ) : (
            todayTrips.map((t) => {
              const status = String(t?.approval_status || "pending").toLowerCase();
              return (
                <div key={t.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        {t.trip_id || `Trip #${t.id}`}{" "}
                        <span className="text-slate-400 font-semibold">•</span>{" "}
                        <span className="text-slate-700 font-semibold">
                          Owner: {t.owner_code || "—"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <FiMapPin className="h-3.5 w-3.5" />
                          {t.near_station || "—"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>Planned: {fmtDT(t.planned_at)}</span>
                        <span className="text-slate-300">•</span>
                        <span>Arrival: {fmtDT(t.arrival_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700">
                        {t.fishing_method || "—"}
                      </span>

                      <span
                        className={[
                          "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
                          status === "approved"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-amber-200 bg-amber-50 text-amber-900",
                        ].join(" ")}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, tone = "slate" }) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-400/10 text-amber-900"
      : "bg-slate-900 text-white";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-slate-900/5 blur-2xl" />
      </div>

      <div className="relative p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded-2xl ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </div>
        </div>

        <div className="text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
        </div>

        <div className="mt-1 text-xs text-slate-500">{helper}</div>
      </div>
    </div>
  );
}
