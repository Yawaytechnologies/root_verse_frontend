// src/modules/admin/aquaculture/pages/Harvest.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Harvest (Admin)
 * ✅ Clean filters + compact table
 * ✅ View modal shows remaining details (scrollable)
 * ✅ Optional actions in modal: Confirm / Reject, Print Batch QR (payload demo)
 *
 * Replace mock data + code generators with API later.
 */

const STATUS_TONE = {
  PENDING: "amber",
  CONFIRMED: "green",
  REJECTED: "red",
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
function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    green: "bg-emerald-600 text-white hover:bg-emerald-700 ring-1 ring-emerald-700/20",
    red: "bg-rose-600 text-white hover:bg-rose-700 ring-1 ring-rose-700/20",
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

/* Demo code generators (replace with backend) */
function genBatchCode(seq) {
  return `H-BATCH-${String(seq).padStart(4, "0")}`;
}
function makeBatchQrPayload({ harvestId, batchCode, farmId, pondId }) {
  return `ROOTVERSE|HARVEST=${harvestId}|BATCH=${batchCode}|FARM=${farmId}|POND=${pondId}`;
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

export default function Harvest() {
  const pageStyle = (
    <style>{`
      .rvHarvestPage{
        --rv-accent:#25B7FF;
        --rv-bg:#EEF2F7;
        --rv-ink:#0F172A;
        --rv-muted:#64748B;
        background: var(--rv-bg);
      }
    `}</style>
  );

  // Mock harvest records
  const [harvests, setHarvests] = useState(() => [
    {
      id: "H-00041",
      date: "2026-03-06",
      startTime: "05:40",
      endTime: "07:15",
      farmId: "FRM-0001",
      farmName: "Blue Creek Farm",
      pondId: "POND-0001",
      pondName: "P01",
      species: "Shrimp · L. vannamei",
      method: "Cast net + Drag",
      weightKg: 1240,
      crateCount: 31,
      status: "PENDING",
      createdBy: "Supervisor",
      createdAt: "2026-03-06 08:10",
      buyer: "Local Processor A",
      qc: { icing: "OK", tempC: 3.8, grade: "A/B mix", remarks: "Good firmness" },
      notes: "Harvest started earlier due to high temp forecast.",
      batchCode: null,
      batchQrPayload: null,
      rejectReason: "",
      crates: [
        { crateCode: "CRT-000901", weightKg: 40, grade: "A" },
        { crateCode: "CRT-000902", weightKg: 38, grade: "A" },
        { crateCode: "CRT-000903", weightKg: 42, grade: "B" },
      ],
    },
    {
      id: "H-00040",
      date: "2026-03-05",
      startTime: "06:10",
      endTime: "08:05",
      farmId: "FRM-0002",
      farmName: "Sunrise Aquafarm",
      pondId: "POND-0007",
      pondName: "P07",
      species: "Tilapia",
      method: "Seine",
      weightKg: 840,
      crateCount: 21,
      status: "CONFIRMED",
      createdBy: "Supervisor",
      createdAt: "2026-03-05 09:20",
      buyer: "Wholesale B",
      qc: { icing: "OK", tempC: 4.2, grade: "A", remarks: "Normal" },
      notes: "Completed smoothly.",
      batchCode: "H-BATCH-0003",
      batchQrPayload: "ROOTVERSE|HARVEST=H-00040|BATCH=H-BATCH-0003|FARM=FRM-0002|POND=POND-0007",
      rejectReason: "",
      crates: [
        { crateCode: "CRT-000801", weightKg: 36, grade: "A" },
        { crateCode: "CRT-000802", weightKg: 41, grade: "A" },
      ],
    },
    {
      id: "H-00039",
      date: "2026-03-05",
      startTime: "05:50",
      endTime: "06:30",
      farmId: "FRM-0001",
      farmName: "Blue Creek Farm",
      pondId: "POND-0002",
      pondName: "P02",
      species: "Shrimp · L. vannamei",
      method: "Trial harvest",
      weightKg: 160,
      crateCount: 4,
      status: "REJECTED",
      createdBy: "Field Staff",
      createdAt: "2026-03-05 07:10",
      buyer: "—",
      qc: { icing: "Not OK", tempC: 9.6, grade: "—", remarks: "Temperature high" },
      notes: "Trial lot, quality not acceptable.",
      batchCode: null,
      batchQrPayload: null,
      rejectReason: "Icing not adequate; temp above limit.",
      crates: [{ crateCode: "CRT-000700", weightKg: 40, grade: "—" }],
    },
  ]);

  const [date, setDate] = useState(() => toISODate(new Date()));
  const [pond, setPond] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const ponds = useMemo(() => {
    const m = new Map();
    harvests.forEach((h) => m.set(h.pondId, `${h.farmName} · ${h.pondName}`));
    return Array.from(m.entries()).map(([id, label]) => ({ id, label }));
  }, [harvests]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return harvests
      .filter((h) => (date ? h.date === date : true))
      .filter((h) => (pond === "ALL" ? true : h.pondId === pond))
      .filter((h) => (status === "ALL" ? true : h.status === status))
      .filter((h) => {
        if (!qq) return true;
        const blob = [
          h.id,
          h.farmName,
          h.pondName,
          h.pondId,
          h.species,
          h.method,
          h.createdBy,
          h.buyer,
          h.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(qq);
      })
      .sort((a, b) => (a.date + a.startTime < b.date + b.startTime ? 1 : -1));
  }, [harvests, date, pond, status, q]);

  const stats = useMemo(() => {
    const count = filtered.length;
    const totalKg = filtered.reduce((s, h) => s + (h.weightKg || 0), 0);
    const pending = filtered.filter((h) => h.status === "PENDING").length;
    const crates = filtered.reduce((s, h) => s + (h.crateCount || 0), 0);
    return { count, totalKg, pending, crates };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [date, pond, status, q]);

  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  function openView(h) {
    setSelected(h);
    setRejectReason(h.rejectReason || "");
  }
  function closeView() {
    setSelected(null);
    setRejectReason("");
  }

  function confirmSelected() {
    if (!selected) return;
    if (selected.status !== "PENDING") return;

    const nextSeq = 1 + harvests.filter((h) => h.status === "CONFIRMED" && h.batchCode).length;
    const batchCode = selected.batchCode || genBatchCode(nextSeq);
    const payload =
      selected.batchQrPayload ||
      makeBatchQrPayload({
        harvestId: selected.id,
        batchCode,
        farmId: selected.farmId,
        pondId: selected.pondId,
      });

    const updated = {
      ...selected,
      status: "CONFIRMED",
      batchCode,
      batchQrPayload: payload,
      rejectReason: "",
    };

    setHarvests((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    setSelected(updated);
  }

  function rejectSelected() {
    if (!selected) return;
    if (!rejectReason.trim()) {
      alert("Enter reject reason.");
      return;
    }
    const updated = {
      ...selected,
      status: "REJECTED",
      rejectReason: rejectReason.trim(),
      batchCode: null,
      batchQrPayload: null,
    };
    setHarvests((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    setSelected(updated);
  }

  return (
    <div className="rvHarvestPage min-h-full">
      {pageStyle}

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--rv-ink)]">Harvest</h1>
          <p className="mt-1.5 text-sm text-[var(--rv-muted)]">
            View harvest records by pond/date. Open a harvest to see full traceability details.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <MetricCard label="HARVESTS" value={stats.count} sub="For selected filters" />
          <MetricCard label="TOTAL WEIGHT (KG)" value={n2(stats.totalKg)} sub="Sum of filtered harvests" />
          <MetricCard label="PENDING" value={stats.pending} sub="Needs confirmation" />
          <MetricCard label="CRATES" value={n2(stats.crates)} sub="Total crates recorded" />
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-2xl bg-white shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/5">
          <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="relative pl-3">
              <span className="absolute left-0 top-1.5 h-5 w-1 rounded-full" style={{ background: "var(--rv-accent)" }} />
              <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-600">FILTERS</div>
              <div className="mt-1 text-sm text-[var(--rv-muted)]">Pick date + pond + status.</div>
            </div>

            <div className="grid w-full gap-3 md:w-auto md:grid-cols-3">
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

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 py-2.5 px-3 text-sm text-slate-800 ring-1 ring-black/5 focus:bg-white focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "var(--rv-accent)" }}
              >
                <option value="ALL">All status</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="REJECTED">REJECTED</option>
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
                placeholder="Search harvest id, farm, pond, species, method..."
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
                  <th className="border-b border-slate-100 py-2.5 pr-4">HARVEST</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">POND</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">DATE/TIME</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">SPECIES</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">WEIGHT</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">CRATES</th>
                  <th className="border-b border-slate-100 py-2.5 pr-4">STATUS</th>
                  <th className="border-b border-slate-100 py-2.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="text-sm font-semibold text-[var(--rv-ink)]">No harvest records</div>
                      <div className="mt-2 text-sm text-[var(--rv-muted)]">Change date/filters.</div>
                    </td>
                  </tr>
                ) : (
                  paged.map((h) => (
                    <tr key={h.id} className="border-t border-slate-100">
                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">{h.id}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">
                          Batch: <span className="font-semibold text-slate-700">{h.batchCode || "—"}</span>
                        </div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm font-semibold text-[var(--rv-ink)]">{h.farmName} · {h.pondName}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">{h.pondId}</div>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <div className="text-sm text-slate-800">{h.date}</div>
                        <div className="mt-1 text-xs text-[var(--rv-muted)]">{h.startTime} - {h.endTime}</div>
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-slate-800">{h.species}</td>
                      <td className="py-4 pr-4 align-top text-sm text-slate-800">{n2(h.weightKg)} kg</td>
                      <td className="py-4 pr-4 align-top text-sm text-slate-800">{n2(h.crateCount)}</td>

                      <td className="py-4 pr-4 align-top">
                        <Badge tone={STATUS_TONE[h.status] || "slate"}>{h.status}</Badge>
                      </td>

                      <td className="py-4 text-right align-top">
                        <ActionButton onClick={() => openView(h)} icon={<IconEye className="h-4 w-4" />}>
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
        title={selected ? `Harvest · ${selected.id} · ${selected.farmName} · ${selected.pondName}` : ""}
        subtitle={selected ? `${selected.date} ${selected.startTime}-${selected.endTime} · ${selected.species}` : ""}
      >
        {selected ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Left details */}
            <div className="md:col-span-2">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">SUMMARY</div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Status" value={<Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>} />
                  <Field label="Batch Code" value={selected.batchCode || "— (generated after confirm)"} />
                  <Field label="Farm ID" value={selected.farmId} />
                  <Field label="Pond ID" value={selected.pondId} />
                  <Field label="Method" value={selected.method} />
                  <Field label="Buyer" value={selected.buyer} />
                  <Field label="Weight (kg)" value={n2(selected.weightKg)} />
                  <Field label="Crates" value={n2(selected.crateCount)} />
                  <Field label="Created By" value={selected.createdBy} />
                  <Field label="Created At" value={selected.createdAt} />
                </div>

                {selected.notes ? (
                  <div className="mt-4 rounded-2xl bg-white p-3 ring-1 ring-black/5">
                    <div className="text-xs text-[var(--rv-muted)]">Notes</div>
                    <div className="mt-1 text-sm text-slate-800">{selected.notes}</div>
                  </div>
                ) : null}

                {selected.status === "REJECTED" && selected.rejectReason ? (
                  <div className="mt-4 rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200">
                    <div className="text-xs text-rose-700 font-semibold">Reject reason</div>
                    <div className="mt-1 text-sm text-rose-800">{selected.rejectReason}</div>
                  </div>
                ) : null}
              </div>

              {/* QC */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">QUALITY CHECK</div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <Field label="Icing" value={selected.qc?.icing} />
                  <Field label="Temp (°C)" value={n2(selected.qc?.tempC)} />
                  <Field label="Grade" value={selected.qc?.grade} />
                  <Field label="Remarks" value={selected.qc?.remarks} />
                </div>
              </div>

              {/* Crates preview (simple) */}
              <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">CRATES (PREVIEW)</div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold tracking-[0.16em] text-slate-600">
                        <th className="border-b border-slate-100 py-2 pr-3">CRATE</th>
                        <th className="border-b border-slate-100 py-2 pr-3">WEIGHT (KG)</th>
                        <th className="border-b border-slate-100 py-2 pr-3">GRADE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.crates || []).map((c) => (
                        <tr key={c.crateCode} className="border-t border-slate-100">
                          <td className="py-2 pr-3 text-sm text-slate-800 font-semibold">{c.crateCode}</td>
                          <td className="py-2 pr-3 text-sm text-slate-800">{n2(c.weightKg)}</td>
                          <td className="py-2 pr-3 text-sm text-slate-800">{c.grade}</td>
                        </tr>
                      ))}
                      {(!selected.crates || selected.crates.length === 0) ? (
                        <tr><td colSpan={3} className="py-8 text-center text-sm text-[var(--rv-muted)]">No crate rows</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right actions */}
            <div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-600">TRACEABILITY OUTPUTS</div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-black/5">
                  <div className="text-xs font-semibold text-slate-700">Batch QR payload</div>
                  <div className="mt-2 rounded-xl bg-white p-2 text-[11px] text-slate-700 ring-1 ring-black/5 break-words font-mono">
                    {selected.batchQrPayload || "— (generated after confirm)"}
                  </div>

                  {selected.status === "CONFIRMED" && selected.batchQrPayload ? (
                    <div className="mt-3">
                      <ActionButton
                        tone="accent"
                        onClick={() => printPayload(selected.batchQrPayload, "Harvest Batch QR Payload")}
                        icon={<IconQr className="h-4 w-4" />}
                      >
                        Print Batch QR
                      </ActionButton>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4">
                  {selected.status === "PENDING" ? (
                    <>
                      <ActionButton tone="green" onClick={confirmSelected} icon={<IconCheck className="h-4 w-4" />}>
                        Confirm Harvest
                      </ActionButton>

                      <div className="mt-3">
                        <div className="text-xs text-[var(--rv-muted)]">Reject reason</div>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-2 w-full rounded-2xl bg-slate-50 p-3 text-sm text-slate-800 ring-1 ring-black/5 focus:bg-white focus:outline-none focus:ring-2"
                          style={{ "--tw-ring-color": "var(--rv-accent)" }}
                          rows={3}
                          placeholder="Why reject this harvest?"
                        />
                      </div>

                      <div className="mt-3">
                        <ActionButton tone="red" onClick={rejectSelected} icon={<IconX className="h-4 w-4" />}>
                          Reject Harvest
                        </ActionButton>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--rv-muted)]">
                      This harvest is already{" "}
                      <span className="font-semibold text-[var(--rv-ink)]">{selected.status.toLowerCase()}</span>.
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <ActionButton onClick={closeView} icon={<IconX className="h-4 w-4" />}>
                    Close
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