// src/modules/admin/aquaculture/pages/Crate.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Crate (Admin)
 * ✅ Clean filters + compact table
 * ✅ View modal shows remaining details + timeline table (chain-of-custody)
 * ✅ Modal scrollable + fits in view
 * ✅ Print QR payload demo
 *
 * Replace mock data with API later.
 */

const STATUS_TONE = {
  CREATED: "blue",
  IN_TRANSIT: "amber",
  RECEIVED: "green",
  FLAGGED: "red",
};

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 18a7 7 0 1 0-7-7 7 7 0 0 0 7 7Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconQr(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 6h-1v-3h3v1m0 2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M7 3v3M17 3v3M4 8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-black/5 ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
      <div className="p-5">
        <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">{label}</div>
        <div className="mt-2.5 text-2xl font-semibold text-[var(--rv-ink)]">{value}</div>
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
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${tones[tone] || tones.slate}`}
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
      <div className="mt-1 text-sm font-semibold text-[var(--rv-ink)]">{value ?? "—"}</div>
    </div>
  );
}

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
              <div className="text-base font-semibold text-[var(--rv-ink)] truncate">{title}</div>
              {subtitle ? <div className="mt-1 text-sm text-[var(--rv-muted)] truncate">{subtitle}</div> : null}
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

          <div className="px-5 py-5 overflow-y-auto overscroll-contain">{children}</div>
        </div>
      </div>
    </div>
  );
}

function makeCrateQrPayload({ crateCode, batchCode, farmId, pondId }) {
  return `ROOTVERSE|CRATE=${crateCode}|BATCH=${batchCode}|FARM=${farmId}|POND=${pondId}`;
}

function printPayload(payload, title = "Print") {
  const w = window.open("", "_blank", "width=520,height=620");
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body{font-family:Arial; padding:24px;}
          .box{border:1px solid #ddd; border-radius:12px; padding:16px;}
          .title{font-size:18px; font-weight:700; margin-bottom:8px;}
          .muted{color:#555; font-size:12px; margin-top:10px;}
          .code{font-family:monospace; white-space:pre-wrap; word-break:break-word; background:#f7f7f7; padding:12px; border-radius:10px;}
        </style>
      </head>
      <body>
        <div class="box">
          <div class="title">${title}</div>
          <div class="code">${payload}</div>
          <div class="muted">Replace this with real QR graphic later.</div>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
  w.document.close();
}

const PAGE_SIZE = 10;

export default function Crate() {
  const pageStyle = (
    <style>{`
      .rvCratePage{
        --rv-accent:#25B7FF;
        --rv-bg:#EEF2F7;
        --rv-ink:#0F172A;
        --rv-muted:#64748B;
        background: var(--rv-bg);
      }
    `}</style>
  );

  // Mock crate records
  const [crates] = useState(() => [
    {
      crateCode: "CRT-000901",
      date: "2026-03-06",
      packedAt: "08:20",
      batchCode: "H-BATCH-0004",
      farmId: "FRM-0001",
      farmName: "Blue Creek Farm",
      pondId: "POND-0001",
      pondName: "P01",
      weightKg: 40,
      grade: "A",
      status: "IN_TRANSIT",
      lastScanAt: "2026-03-06 10:05",
      lastLocation: "Route to Hub",
      qrPayload: makeCrateQrPayload({
        crateCode: "CRT-000901",
        batchCode: "H-BATCH-0004",
        farmId: "FRM-0001",
        pondId: "POND-0001",
      }),
      timeline: [
        { at: "2026-03-06 08:25", action: "CREATED", actor: "Supervisor", location: "Farm" },
        { at: "2026-03-06 08:40", action: "SEALED", actor: "Supervisor", location: "Farm" },
        { at: "2026-03-06 09:10", action: "DISPATCHED", actor: "Driver", location: "Farm Gate" },
        { at: "2026-03-06 10:05", action: "SCAN", actor: "Driver", location: "Route to Hub" },
      ],
      issues: [],
    },
    {
      crateCode: "CRT-000902",
      date: "2026-03-06",
      packedAt: "08:22",
      batchCode: "H-BATCH-0004",
      farmId: "FRM-0001",
      farmName: "Blue Creek Farm",
      pondId: "POND-0001",
      pondName: "P01",
      weightKg: 38,
      grade: "A",
      status: "RECEIVED",
      lastScanAt: "2026-03-06 11:30",
      lastLocation: "Registry Hub",
      qrPayload: makeCrateQrPayload({
        crateCode: "CRT-000902",
        batchCode: "H-BATCH-0004",
        farmId: "FRM-0001",
        pondId: "POND-0001",
      }),
      timeline: [
        { at: "2026-03-06 08:26", action: "CREATED", actor: "Supervisor", location: "Farm" },
        { at: "2026-03-06 09:05", action: "DISPATCHED", actor: "Driver", location: "Farm Gate" },
        { at: "2026-03-06 11:30", action: "RECEIVED", actor: "Hub Staff", location: "Registry Hub" },
      ],
      issues: [],
    },
    {
      crateCode: "CRT-000700",
      date: "2026-03-05",
      packedAt: "07:05",
      batchCode: "—",
      farmId: "FRM-0001",
      farmName: "Blue Creek Farm",
      pondId: "POND-0002",
      pondName: "P02",
      weightKg: 40,
      grade: "—",
      status: "FLAGGED",
      lastScanAt: "2026-03-05 07:25",
      lastLocation: "Farm",
      qrPayload: makeCrateQrPayload({
        crateCode: "CRT-000700",
        batchCode: "—",
        farmId: "FRM-0001",
        pondId: "POND-0002",
      }),
      timeline: [
        { at: "2026-03-05 07:06", action: "CREATED", actor: "Field Staff", location: "Farm" },
        { at: "2026-03-05 07:25", action: "FLAGGED", actor: "Supervisor", location: "Farm" },
      ],
      issues: ["Temperature too high at packing"],
    },
  ]);

  const [date, setDate] = useState(() => toISODate(new Date()));
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return crates
      .filter((c) => (date ? c.date === date : true))
      .filter((c) => (status === "ALL" ? true : c.status === status))
      .filter((c) => {
        if (!qq) return true;
        const blob = [
          c.crateCode,
          c.batchCode,
          c.farmName,
          c.pondName,
          c.pondId,
          c.grade,
          c.lastLocation,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(qq);
      })
      .sort((a, b) => (a.date + a.packedAt < b.date + b.packedAt ? 1 : -1));
  }, [crates, date, status, q]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const inTransit = filtered.filter((c) => c.status === "IN_TRANSIT").length;
    const received = filtered.filter((c) => c.status === "RECEIVED").length;
    const flagged = filtered.filter((c) => c.status === "FLAGGED").length;
    return { total, inTransit, received, flagged };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [date, status, q]);

  const [selected, setSelected] = useState(null);

  function openView(c) {
    setSelected(c);
  }
  function closeView() {
    setSelected(null);
  }

  return (
    <div className="rvCratePage min-h-full">
      {pageStyle}

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--rv-ink)]">Crate</h1>
          <p className="mt-1.5 text-sm text-[var(--rv-muted)]">
            Track crate chain-of-custody. Open a crate to view full movement timeline.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MetricCard label="CRATES" value={stats.total} sub="For selected filters" />
          <MetricCard label="IN TRANSIT" value={stats.inTransit} sub="Moving to hub" />
          <MetricCard label="RECEIVED" value={stats.received} sub="Reached destination" />
          <MetricCard label="FLAGGED" value={stats.flagged} sub="Issues found" />
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="relative pl-3">
              <span className="absolute left-0 top-1.5 h-5 w-1 rounded-full" style={{ background: "var(--rv-accent)" }} />
              <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">FILTERS</div>
              <div className="mt-1 text-sm text-[var(--rv-muted)]">Pick date + status, then search.</div>
            </div>

            <div className="grid w-full gap-3 md:w-auto md:grid-cols-2">
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

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 py-2.5 px-3 text-sm text-slate-800 ring-1 ring-black/5 focus:bg-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--rv-accent)" }}
              >
                <option value="ALL">All status</option>
                <option value="CREATED">CREATED</option>
                <option value="IN_TRANSIT">IN TRANSIT</option>
                <option value="RECEIVED">RECEIVED</option>
                <option value="FLAGGED">FLAGGED</option>
              </select>
            </div>
          </div>

          <div className="px-6 pb-5">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <IconSearch className="h-5 w-5" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search crate code, batch code, pond, grade, location..."
                className="w-full rounded-2xl bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-800 ring-1 ring-black/5 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--rv-accent)" }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="overflow-x-auto px-6 py-5">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  <th className="border-b border-slate-100 py-2.5 pr-4">CRATE</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">BATCH</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">ORIGIN</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">PACKED</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">WEIGHT</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">GRADE</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">STATUS</th>
                  <th className="border-b border-slate-100 py-2.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="text-sm font-semibold text-[var(--rv-ink)]">No crate records</div>
                      <div className="mt-2 text-sm text-[var(--rv-muted)]">Change date/filters.</div>
                    </td>
                  </tr>
                ) : (
                  paged.map((c) => (
                    <tr key={c.crateCode} className="border-t border-slate-100">
                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">{c.crateCode}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          Last scan: <span className="font-semibold text-slate-700">{c.lastScanAt}</span>
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">{c.batchCode}</td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">{c.farmName} · {c.pondName}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">{c.pondId}</div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-slate-800">{c.date}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">{c.packedAt}</div>
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">{n2(c.weightKg)} kg</td>
                      <td className="py-4 pr-4 align-top text-sm text-slate-800">{c.grade}</td>

                      <td className="py-4 pr-4 align-top">
                        <Badge tone={STATUS_TONE[c.status] || "slate"}>{c.status}</Badge>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">{c.lastLocation}</div>
                      </td>

                      <td className="py-4 text-right align-top">
                        <ActionButton onClick={() => openView(c)} icon={<IconEye className="h-4 w-4" />}>
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
                Showing <span className="font-semibold text-[var(--rv-ink)]">{paged.length}</span> of{" "}
                <span className="font-semibold text-[var(--rv-ink)]">{filtered.length}</span>
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
                <div>
                  Page <span className="font-semibold text-[var(--rv-ink)]">{page}</span> / {Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
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
      </div>

      {/* View Modal */}
      <ModalShell
        open={!!selected}
        onClose={closeView}
        title={selected ? `Crate · ${selected.crateCode} · ${selected.farmName} · ${selected.pondName}` : ""}
        subtitle={selected ? `${selected.date} ${selected.packedAt} · Batch ${selected.batchCode} · ${selected.status}` : ""}
      >
        {selected ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Left: details + payload */}
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">CRATE DETAILS</div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Crate Code" value={selected.crateCode} />
                  <Field label="Batch Code" value={selected.batchCode} />
                  <Field label="Farm ID" value={selected.farmId} />
                  <Field label="Pond ID" value={selected.pondId} />
                  <Field label="Weight (kg)" value={n2(selected.weightKg)} />
                  <Field label="Grade" value={selected.grade} />
                  <Field label="Status" value={<Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>} />
                  <Field label="Last Location" value={selected.lastLocation} />
                  <Field label="Last Scan" value={selected.lastScanAt} />
                </div>

                {(selected.issues || []).length ? (
                  <div className="mt-4 rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200">
                    <div className="text-xs text-rose-700 font-semibold">Issues</div>
                    <ul className="mt-2 list-disc pl-5 text-sm text-rose-800">
                      {selected.issues.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">QR PAYLOAD</div>
                <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-black/5 font-mono text-[11px] break-words text-slate-700">
                  {selected.qrPayload}
                </div>

                <div className="mt-3">
                  <ActionButton
                    tone="accent"
                    onClick={() => printPayload(selected.qrPayload, "Crate QR Payload")}
                    icon={<IconQr className="h-4 w-4" />}
                  >
                    Print QR
                  </ActionButton>
                </div>
              </div>

              {/* Timeline table */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">CHAIN OF CUSTODY</div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold tracking-[0.16em] text-slate-600">
                        <th className="border-b border-slate-100 py-2 pr-3">TIME</th>
                        <th className="border-b border-slate-100 py-2 pr-3">ACTION</th>
                        <th className="border-b border-slate-100 py-2 pr-3">ACTOR</th>
                        <th className="border-b border-slate-100 py-2 pr-3">LOCATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.timeline || []).map((t, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="py-2 pr-3 text-sm text-slate-800">{t.at}</td>
                          <td className="py-2 pr-3 text-sm text-slate-800 font-semibold">{t.action}</td>
                          <td className="py-2 pr-3 text-sm text-slate-800">{t.actor}</td>
                          <td className="py-2 pr-3 text-sm text-slate-800">{t.location}</td>
                        </tr>
                      ))}
                      {(!selected.timeline || selected.timeline.length === 0) ? (
                        <tr><td colSpan={4} className="py-8 text-center text-sm text-[var(--rv-muted)]">No timeline events</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: quick summary + close */}
            <div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">QUICK SUMMARY</div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5 text-sm text-[var(--rv-muted)]">
                  <div>
                    Pond: <span className="font-semibold text-[var(--rv-ink)]">{selected.pondName}</span>
                  </div>
                  <div className="mt-1">
                    Batch: <span className="font-semibold text-[var(--rv-ink)]">{selected.batchCode}</span>
                  </div>
                  <div className="mt-1">
                    Weight: <span className="font-semibold text-[var(--rv-ink)]">{n2(selected.weightKg)} kg</span>
                  </div>
                  <div className="mt-1">
                    Status:{" "}
                    <span className="font-semibold text-[var(--rv-ink)]">{selected.status}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <ActionButton onClick={closeView} icon={<IconX className="h-4 w-4" />}>
                    Close
                  </ActionButton>

                  <ActionButton
                    tone="accent"
                    onClick={() => alert("Hook this to crate detail route / export / admin action")}
                    icon={<IconEye className="h-4 w-4" />}
                  >
                    Open Full Crate Page
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