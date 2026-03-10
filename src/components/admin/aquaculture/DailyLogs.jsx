// src/modules/admin/aquaculture/pages/DailyLog.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Daily Log (Pond)
 * ✅ Clean UI: date + pond filters + search
 * ✅ Compact table: only key columns
 * ✅ View popup (modal) shows remaining details (water, feed, health, ops, notes)
 * ✅ Modal scrollable + fits any screen
 * ✅ Mobile-friendly (cards)
 *
 * Replace mock data with API later.
 */

const STATUS_TONE = {
  OK: "green",
  ATTENTION: "amber",
  ALERT: "red",
};

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 18a7 7 0 1 0-7-7 7 7 0 0 0 7 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 3v3M17 3v3M4 8h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-black/5 ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <div className="p-5">
        <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">
          {label}
        </div>
        <div className="mt-2.5 text-2xl font-semibold text-[var(--rv-ink)]">
          {value}
        </div>
        <div className="mt-1.5 text-sm text-[var(--rv-muted)]">{sub}</div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, children, icon, tone = "slate" }) {
  const tones = {
    slate: "bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-black/10",
    accent: "text-white ring-1 ring-black/10 hover:opacity-95",
  };
  const style = tone === "accent" ? { background: "var(--rv-accent)" } : undefined;

  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
        tones[tone] || tones.slate
      }`}
      style={style}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </button>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-[var(--rv-muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">
        {value ?? "—"}
      </div>
    </div>
  );
}

/* ✅ Scrollable modal + locks background scroll */
function ModalShell({ open, title, subtitle, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-start justify-center p-3 md:p-6">
        <div className="w-full max-w-[980px] max-h-[calc(100vh-1.5rem)] md:max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/10 flex flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 shrink-0">
            <div className="min-w-0">
              <div className="text-base font-semibold text-[var(--rv-ink)] truncate">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 text-sm text-[var(--rv-muted)] truncate">
                  {subtitle}
                </div>
              ) : null}
            </div>

            <button
              onClick={onClose}
              type="button"
              className="rounded-xl bg-slate-100 p-2 text-slate-700 ring-1 ring-black/5 hover:bg-slate-200 shrink-0"
              aria-label="Close"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-5 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Utils */
function toISODate(d) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function n2(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return typeof v === "number" ? v.toFixed(2).replace(/\.00$/, "") : String(v);
}

const PAGE_SIZE = 10;

export default function DailyLog() {
  const pageStyle = (
    <style>{`
      .rvDailyLogPage{
        --rv-accent:#25B7FF;
        --rv-bg:#EEF2F7;
        --rv-ink:#0F172A;
        --rv-muted:#64748B;
        background: var(--rv-bg);
      }
    `}</style>
  );

  // Mock logs (replace with API)
  const [logs] = useState(() => [
    {
      id: 1,
      date: "2026-03-06",
      time: "08:40",
      farmId: "FRM-0001",
      farmName: "Blue Creek Farm",
      pondId: "POND-0001",
      pondName: "P01",
      dayOfCycle: 42,
      stage: "Mid grow-out",
      status: "OK",
      feed: {
        feedKg: 32,
        feedType: "Pellet 35%",
        feedTimes: "06:30, 12:30, 18:30",
      },
      water: {
        tempC: 29.4,
        ph: 7.8,
        doMgL: 5.6,
        salinityPpt: 14,
        ammonia: 0.12,
        nitrite: 0.08,
        alkalinity: 130,
        turbidity: "Normal",
      },
      health: {
        mortality: 12,
        abnormal: "None observed",
        treatment: "—",
      },
      ops: {
        aerationHrs: 18,
        waterExchangePct: 5,
        remarks: "Aerators running stable.",
      },
      notes: "Feeding response good. No visible stress.",
      createdBy: "Field Staff A",
      createdAt: "2026-03-06 09:05",
    },
    {
      id: 2,
      date: "2026-03-06",
      time: "08:55",
      farmId: "FRM-0001",
      farmName: "Blue Creek Farm",
      pondId: "POND-0002",
      pondName: "P02",
      dayOfCycle: 18,
      stage: "Early grow-out",
      status: "ATTENTION",
      feed: {
        feedKg: 18,
        feedType: "Crumbles",
        feedTimes: "07:00, 13:00, 19:00",
      },
      water: {
        tempC: 30.1,
        ph: 8.2,
        doMgL: 4.3,
        salinityPpt: 12,
        ammonia: 0.28,
        nitrite: 0.14,
        alkalinity: 110,
        turbidity: "Slight cloudy",
      },
      health: {
        mortality: 28,
        abnormal: "Low feeding activity morning",
        treatment: "Probiotic (as per SOP)",
      },
      ops: {
        aerationHrs: 20,
        waterExchangePct: 8,
        remarks: "Increase aeration; monitor ammonia.",
      },
      notes: "Recommended partial exchange; retest in evening.",
      createdBy: "Field Staff B",
      createdAt: "2026-03-06 09:20",
    },
    {
      id: 3,
      date: "2026-03-05",
      time: "09:10",
      farmId: "FRM-0002",
      farmName: "Sunrise Aquafarm",
      pondId: "POND-0007",
      pondName: "P07",
      dayOfCycle: 65,
      stage: "Pre-harvest",
      status: "ALERT",
      feed: {
        feedKg: 40,
        feedType: "Pellet 40%",
        feedTimes: "06:00, 12:00, 18:00",
      },
      water: {
        tempC: 31.0,
        ph: 8.4,
        doMgL: 3.2,
        salinityPpt: 9,
        ammonia: 0.45,
        nitrite: 0.22,
        alkalinity: 90,
        turbidity: "High",
      },
      health: {
        mortality: 70,
        abnormal: "Surface gasping observed",
        treatment: "Emergency aeration + water exchange",
      },
      ops: {
        aerationHrs: 24,
        waterExchangePct: 15,
        remarks: "Immediate corrective action taken.",
      },
      notes: "Escalated to supervisor. Recheck DO hourly.",
      createdBy: "Supervisor",
      createdAt: "2026-03-05 09:45",
    },
  ]);

  const [date, setDate] = useState(() => toISODate(new Date()));
  const [pond, setPond] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const ponds = useMemo(() => {
    const unique = new Map();
    logs.forEach((l) => unique.set(l.pondId, `${l.farmName} · ${l.pondName}`));
    return Array.from(unique.entries()).map(([id, label]) => ({ id, label }));
  }, [logs]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return logs
      .filter((l) => (date ? l.date === date : true))
      .filter((l) => (pond === "ALL" ? true : l.pondId === pond))
      .filter((l) => (status === "ALL" ? true : l.status === status))
      .filter((l) => {
        if (!qq) return true;
        const blob = [
          l.farmName,
          l.pondName,
          l.pondId,
          l.stage,
          l.createdBy,
          l.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(qq);
      })
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  }, [logs, date, pond, status, q]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const avgFeed =
      count === 0
        ? 0
        : filtered.reduce((sum, l) => sum + (l.feed?.feedKg || 0), 0) / count;
    const alerts = filtered.filter((l) => l.status === "ALERT").length;
    const attention = filtered.filter((l) => l.status === "ATTENTION").length;
    return { count, avgFeed, alerts, attention };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [date, pond, status, q]);

  const [selected, setSelected] = useState(null);

  function openView(log) {
    setSelected(log);
  }
  function closeView() {
    setSelected(null);
  }

  return (
    <div className="rvDailyLogPage min-h-full">
      {pageStyle}

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--rv-ink)]">
            Daily Log
          </h1>
          <p className="mt-1.5 text-sm text-[var(--rv-muted)]">
            View daily pond logs. Use filters, then open a log to see full details.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MetricCard label="LOGS" value={stats.count} sub="For selected date/filter" />
          <MetricCard label="AVG FEED (KG)" value={n2(stats.avgFeed)} sub="Across filtered logs" />
          <MetricCard label="ATTENTION" value={stats.attention} sub="Needs follow-up" />
          <MetricCard label="ALERT" value={stats.alerts} sub="Immediate action" />
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="relative pl-3">
              <span
                className="absolute left-0 top-1.5 h-5 w-1 rounded-full"
                style={{ background: "var(--rv-accent)" }}
              />
              <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">
                FILTERS
              </div>
              <div className="mt-1 text-sm text-[var(--rv-muted)]">
                Pick date + pond. Search optional.
              </div>
            </div>

            <div className="grid w-full gap-3 md:w-auto md:grid-cols-3">
              {/* Date */}
              <label className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <IconCalendar className="h-5 w-5" />
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 py-2.5 pl-11 pr-3 text-sm text-slate-800 ring-1 ring-black/5 focus:bg-white focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "var(--rv-accent)" }}
                />
              </label>

              {/* Pond */}
              <select
                value={pond}
                onChange={(e) => setPond(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 py-2.5 px-3 text-sm text-slate-800 ring-1 ring-black/5 focus:bg-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--rv-accent)" }}
              >
                <option value="ALL">All ponds</option>
                {ponds.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 py-2.5 px-3 text-sm text-slate-800 ring-1 ring-black/5 focus:bg-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--rv-accent)" }}
              >
                <option value="ALL">All status</option>
                <option value="OK">OK</option>
                <option value="ATTENTION">ATTENTION</option>
                <option value="ALERT">ALERT</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 pb-5">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <IconSearch className="h-5 w-5" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search farm, pond, staff, notes..."
                className="w-full rounded-2xl bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-800 ring-1 ring-black/5 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--rv-accent)" }}
              />
            </div>
          </div>
        </div>

        {/* Table (desktop) */}
        <div className="mt-6 hidden md:block rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="overflow-x-auto px-6 py-5">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  <th className="border-b border-slate-100 py-2.5 pr-4">DATE/TIME</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">POND</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">DAY/STAGE</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">FEED (KG)</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">MORTALITY</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">TEMP</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">PH</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">DO</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">STATUS</th>
                  <th className="border-b border-slate-100 py-2.5 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="text-sm font-semibold text-[var(--rv-ink)]">No logs found</div>
                      <div className="mt-2 text-sm text-[var(--rv-muted)]">
                        Change date or filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((l) => (
                    <tr key={l.id} className="border-t border-slate-100">
                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-slate-800">{l.date}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">{l.time}</div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">
                          {l.farmName} · {l.pondName}
                        </div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          {l.pondId}
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-slate-800">
                          Day {l.dayOfCycle}
                        </div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">{l.stage}</div>
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">
                        {n2(l.feed?.feedKg)}
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">
                        {n2(l.health?.mortality)}
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">
                        {n2(l.water?.tempC)}°C
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">
                        {n2(l.water?.ph)}
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">
                        {n2(l.water?.doMgL)}
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <Badge tone={STATUS_TONE[l.status] || "slate"}>{l.status}</Badge>
                      </td>

                      <td className="py-4 text-right align-top">
                        <ActionButton
                          onClick={() => openView(l)}
                          icon={<IconEye className="h-4 w-4" />}
                        >
                          View
                        </ActionButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm text-[var(--rv-muted)]">
              <div>
                Showing{" "}
                <span className="font-semibold text-[var(--rv-ink)]">
                  {paged.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--rv-ink)]">
                  {filtered.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-xl bg-white px-3 py-1.5 ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  type="button"
                >
                  Prev
                </button>
                <div className="text-sm">
                  Page{" "}
                  <span className="font-semibold text-[var(--rv-ink)]">{page}</span>{" "}
                  / {totalPages}
                </div>
                <button
                  className="rounded-xl bg-white px-3 py-1.5 ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="mt-6 md:hidden grid gap-3">
          {paged.map((l) => (
            <div
              key={l.id}
              className="rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5"
            >
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[var(--rv-ink)]">
                    {l.farmName} · {l.pondName}
                  </div>
                  <Badge tone={STATUS_TONE[l.status] || "slate"}>{l.status}</Badge>
                </div>

                <div className="mt-1 text-sm text-[var(--rv-muted)]">
                  {l.date} · {l.time} · Day {l.dayOfCycle}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[var(--rv-muted)]">
                  <div>
                    <div className="font-semibold text-[var(--rv-ink)]">{n2(l.feed?.feedKg)} kg</div>
                    <div>Feed</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--rv-ink)]">{n2(l.water?.tempC)}°C</div>
                    <div>Temp</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--rv-ink)]">{n2(l.water?.doMgL)}</div>
                    <div>DO</div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <ActionButton onClick={() => openView(l)} icon={<IconEye className="h-4 w-4" />}>
                    View
                  </ActionButton>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination mobile */}
          <div className="flex items-center justify-between text-sm text-[var(--rv-muted)] px-1">
            <button
              className="rounded-xl bg-white px-3 py-1.5 ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              type="button"
            >
              Prev
            </button>
            <div>
              <span className="font-semibold text-[var(--rv-ink)]">{page}</span> / {totalPages}
            </div>
            <button
              className="rounded-xl bg-white px-3 py-1.5 ring-1 ring-black/10 hover:bg-slate-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Popup */}
      <ModalShell
        open={!!selected}
        onClose={closeView}
        title={
          selected
            ? `Daily Log · ${selected.farmName} · ${selected.pondName}`
            : ""
        }
        subtitle={
          selected
            ? `${selected.date} ${selected.time} · Day ${selected.dayOfCycle} · ${selected.stage}`
            : ""
        }
      >
        {selected ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Left: Summary */}
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  SUMMARY
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Status" value={<Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>} />
                  <Field label="Pond ID" value={selected.pondId} />
                  <Field label="Farm" value={selected.farmName} />
                  <Field label="Pond" value={selected.pondName} />
                  <Field label="Created By" value={selected.createdBy} />
                  <Field label="Created At" value={selected.createdAt} />
                </div>

                {selected.notes ? (
                  <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-black/5">
                    <div className="text-xs text-[var(--rv-muted)]">Notes</div>
                    <div className="mt-1 text-sm text-slate-800">{selected.notes}</div>
                  </div>
                ) : null}
              </div>

              {/* Water quality */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  WATER QUALITY
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Temp (°C)" value={n2(selected.water?.tempC)} />
                  <Field label="pH" value={n2(selected.water?.ph)} />
                  <Field label="DO (mg/L)" value={n2(selected.water?.doMgL)} />
                  <Field label="Salinity (ppt)" value={n2(selected.water?.salinityPpt)} />
                  <Field label="Ammonia" value={n2(selected.water?.ammonia)} />
                  <Field label="Nitrite" value={n2(selected.water?.nitrite)} />
                  <Field label="Alkalinity" value={n2(selected.water?.alkalinity)} />
                  <Field label="Turbidity" value={selected.water?.turbidity} />
                </div>
              </div>

              {/* Feeding */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  FEEDING
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Feed (kg)" value={n2(selected.feed?.feedKg)} />
                  <Field label="Feed Type" value={selected.feed?.feedType} />
                  <Field label="Feed Times" value={selected.feed?.feedTimes} />
                </div>
              </div>

              {/* Health */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  HEALTH
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Mortality" value={n2(selected.health?.mortality)} />
                  <Field label="Abnormal Signs" value={selected.health?.abnormal} />
                  <Field label="Treatment" value={selected.health?.treatment} />
                </div>
              </div>
            </div>

            {/* Right: Operations + Quick view */}
            <div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  OPERATIONS
                </div>

                <div className="mt-3 grid gap-3">
                  <Field label="Aeration (hrs)" value={n2(selected.ops?.aerationHrs)} />
                  <Field label="Water Exchange (%)" value={n2(selected.ops?.waterExchangePct)} />
                  <Field label="Remarks" value={selected.ops?.remarks} />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
                  <div className="text-xs font-semibold text-slate-700">
                    Quick indicators
                  </div>
                  <div className="mt-2 text-sm text-[var(--rv-muted)]">
                    Temp:{" "}
                    <span className="font-semibold text-[var(--rv-ink)]">
                      {n2(selected.water?.tempC)}°C
                    </span>
                    <br />
                    DO:{" "}
                    <span className="font-semibold text-[var(--rv-ink)]">
                      {n2(selected.water?.doMgL)}
                    </span>
                    <br />
                    Feed:{" "}
                    <span className="font-semibold text-[var(--rv-ink)]">
                      {n2(selected.feed?.feedKg)} kg
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <ActionButton
                    onClick={closeView}
                    icon={<IconX className="h-4 w-4" />}
                  >
                    Close
                  </ActionButton>

                  <ActionButton
                    tone="accent"
                    onClick={() => alert("Hook this to 'Open Pond Profile' route")}
                    icon={<IconEye className="h-4 w-4" />}
                  >
                    Open Pond Profile
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </ModalShell>
    </div>
  );
}