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

/**
 * Theme rules:
 * - NO blues/cyans/skys/purples.
 * - Only teal/green + amber + neutral slate.
 */
const ACCENT = {
  teal: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200/70",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
    soft: "from-emerald-50/80 via-white to-emerald-50/40",
  },
  green: {
    text: "text-green-700",
    bg: "bg-green-50",
    ring: "ring-green-200/70",
    border: "border-green-200",
    bar: "bg-green-500",
    soft: "from-green-50/80 via-white to-green-50/40",
  },
  amber: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-200/70",
    border: "border-amber-200",
    bar: "bg-amber-500",
    soft: "from-amber-50/80 via-white to-amber-50/40",
  },
};

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

function Pill({ tone = "teal", icon: Icon, children }) {
  const t = ACCENT[tone] || ACCENT.teal;
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        t.bg,
        t.border,
        t.text,
      ].join(" ")}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </span>
  );
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
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur">
        <div className="absolute inset-0 pointer-events-none">
          {/* soft wash */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/60" />
          {/* blobs */}
          <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-emerald-300/18 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-amber-300/12 blur-3xl" />
          
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Wild Capture • Overview
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>

              <p className="mt-1 text-sm text-slate-600">
                Live totals from{" "}
                <span className="font-semibold text-emerald-700">Owners</span>,{" "}
                <span className="font-semibold text-emerald-700">Vessels</span> and{" "}
                <span className="font-semibold text-emerald-700">Trips</span>.
              </p>

              {(verifiedOwners != null || pendingOwners != null) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {verifiedOwners != null && (
                    <Pill tone="teal" icon={FiCheckCircle}>
                      Verified owners:{" "}
                      <span className="font-extrabold">{verifiedOwners}</span>
                    </Pill>
                  )}
                  {pendingOwners != null && (
                    <Pill tone="amber" icon={FiClock}>
                      Pending owners:{" "}
                      <span className="font-extrabold">{pendingOwners}</span>
                    </Pill>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => dispatch(fetchWildCaptureDashboard())}
              className={[
                "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold",
                "border-emerald-200 bg-white/80 text-slate-900 backdrop-blur",
                "hover:bg-emerald-50 hover:border-emerald-300",
                "shadow-sm transition-colors",
              ].join(" ")}
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

      {/* Stat cards (smaller numbers) */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          tone="teal"
          icon={FiUsers}
          label="Owners"
          value={loading ? "…" : ownersTotal}
          helper="Wild capture registrations"
        />
        <StatCard
          tone="green"
          icon={FiAnchor}
          label="Vessels"
          value={loading ? "…" : vesselsTotal}
          helper="Registered vessels"
        />
        <StatCard
          tone="teal"
          icon={FiMapPin}
          label="Trips"
          value={loading ? "…" : tripsTotal}
          helper="Total trips registered"
        />
        <StatCard
          tone="amber"
          icon={FiClock}
          label="Pending approvals"
          value={loading ? "…" : pendingTrips}
          helper="Trips waiting approval"
        />
      </div>

      {/* Today's trips */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 shadow-sm backdrop-blur">
        <div className="border-b border-slate-200/70 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-extrabold text-slate-900">Today’s Trips</div>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  LIVE
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Trips where planned_at is today (local).
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Showing:{" "}
              <span className="font-extrabold text-emerald-700">{todayTrips.length}</span>
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-200/70">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">Loading…</div>
          ) : todayTrips.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No trips planned for today.
            </div>
          ) : (
            todayTrips.map((t) => {
              const status = String(t?.approval_status || "pending").toLowerCase();
              const st = status === "approved" ? ACCENT.teal : ACCENT.amber;

              return (
                <div key={t.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        {t.trip_id || `Trip #${t.id}`}{" "}
                        <span className="text-slate-300 font-semibold">•</span>{" "}
                        <span className="text-slate-700 font-semibold">
                          Owner:{" "}
                          <span className="text-emerald-700">{t.owner_code || "—"}</span>
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <FiMapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {t.near_station || "—"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>Planned: {fmtDT(t.planned_at)}</span>
                        <span className="text-slate-300">•</span>
                        <span>Arrival: {fmtDT(t.arrival_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                        {t.fishing_method || "—"}
                      </span>

                      <span
                        className={[
                          "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
                          st.bg,
                          st.border,
                          st.text,
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

function StatCard({ icon: Icon, label, value, helper, tone = "teal" }) {
  const t = ACCENT[tone] || ACCENT.teal;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-10 -right-10 h-28 w-28 rounded-full ${t.bg} blur-2xl`} />
        <div className={`absolute inset-0 bg-gradient-to-br ${t.soft} opacity-70`} />
      </div>

      <div className="relative p-4">
        <div className="mb-3 flex items-center gap-3">
          <div
            className={[
              "grid h-10 w-10 place-items-center rounded-2xl ring-1",
              t.bg,
              t.ring,
              t.text,
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className={["text-xs font-semibold uppercase tracking-[0.18em]", t.text].join(" ")}>
            {label}
          </div>
        </div>

        {/* smaller number */}
        <div className="text-[26px] leading-none font-extrabold tracking-tight text-slate-900">
          <span className="relative inline-block">
            {value}
            <span
              className={[
                "absolute -bottom-1 left-0 h-[3px] w-full rounded-full opacity-25",
                t.bar,
              ].join(" ")}
            />
          </span>
        </div>

        <div className="mt-1 text-xs text-slate-500">{helper}</div>
      </div>
    </div>
  );
}
