// src/modules/admin/aquaculture/pages/FarmPondApproval.jsx
/**
 * Farm Approval Page — Mobile-first responsive redesign
 * ─────────────────────────────────────────────────────
 * ✅ Mobile: card layout per farm (no horizontal scroll)
 * ✅ Desktop: full table layout
 * ✅ Status dropdown with approve / reject
 * ✅ Detail modal (full-screen on mobile, centered on desktop)
 * ✅ QR code — ALL farm details encoded (no skip cache bug)
 * ✅ QR modal with download support + encoded details preview
 * ✅ Redux wired → farmSlice + farmActions + farmService
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import QRCode from "qrcode";

import { fetchAllFarms, approveFarm, rejectFarm } from "../../../redux/action/farmActions";
import {
  selectPendingFarms,
  selectApprovedFarms,
  selectFarmsLoading,
  selectFarmsError,
  clearError,
} from "../../../redux/reducer/farmapprovalSlice";

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const SvgIco = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <path d={d} />
  </svg>
);
const IcoCheck    = (p) => <SvgIco d="M20 6 9 17l-5-5" {...p} />;
const IcoX        = (p) => <SvgIco d="M18 6 6 18M6 6l12 12" {...p} />;
const IcoChevron  = (p) => <SvgIco d="m6 9 6 6 6-6" {...p} />;
const IcoRefresh  = (p) => <SvgIco d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16l2.26 2.26A9.75 9.75 0 0 0 12 21a9 9 0 0 0 9-9" {...p} />;
const IcoSearch   = (p) => <SvgIco d="M21 21l-4.3-4.3M11 18A7 7 0 1 0 4 11a7 7 0 0 0 7 7Z" {...p} />;
const IcoMap      = (p) => <SvgIco d="M12 21S5 13.5 5 9a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" {...p} />;
const IcoFarm     = (p) => <SvgIco d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" {...p} />;
const IcoDownload = (p) => <SvgIco d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" {...p} />;
const IcoEye      = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoQr = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h2v2h-2zM18 14h3M14 18h3M20 18v3M14 21h3" />
  </svg>
);

/* ══════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════ */
const STATUS_META = {
  pending:  { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200",       label: "Pending"  },
  approved: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Approved" },
  rejected: { dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 ring-rose-200",           label: "Rejected" },
};

/* ══════════════════════════════════════════
   BUILD QR PAYLOAD
   Plain readable text so any phone scanner
   shows all details without an app.
══════════════════════════════════════════ */
function buildQrPayload(farm) {
  const lines = [
    "=== ROOTVERSE FARM ===",
    `Name     : ${farm.name}`,
    `Code     : ${farm.farm_code}`,
    `Owner    : ${farm.owner_name} (ID: ${farm.owner_id})`,
    `Address  : ${farm.farm_address || "N/A"}`,
    `District : ${farm.district_code}`,
    `State    : ${farm.state_code}`,
    `Country  : ${farm.country_code}`,
    `Area     : ${farm.total_area ? farm.total_area + " acres" : "N/A"}`,
    `Ponds    : ${farm.pond_count ?? "N/A"}`,
    `Water    : ${farm.water_source || "N/A"}`,
    `Lat/Lng  : ${farm.latitude}, ${farm.longitude}`,
    `Status   : ${farm.status}`,
    `Approved : ${farm.updated_at ? new Date(farm.updated_at).toLocaleDateString("en-IN") : "N/A"}`,
    "======================",
  ];
  return lines.join("\n");
}

/* ══════════════════════════════════════════
   REUSABLE ATOMS
══════════════════════════════════════════ */
function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${m.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function FarmCode({ code, id }) {
  return (
    <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 ring-1 ring-slate-200/80">
      {code || `ID-${id}`}
    </span>
  );
}

/* ══════════════════════════════════════════
   STATUS DROPDOWN
══════════════════════════════════════════ */
function StatusDropdown({ farm, onApprove, onReject, isUpdating }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ bottom: 0, left: 0 });
  const btnRef  = useRef();
  const menuRef = useRef();

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function handleToggle() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ bottom: window.innerHeight - r.top + 6, left: r.left });
    setOpen((v) => !v);
  }

  const m = STATUS_META[farm.status] ?? STATUS_META.pending;
  const isPending = farm.status === "pending";

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => isPending && !isUpdating && handleToggle()}
        disabled={isUpdating || !isPending}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition select-none
          ${m.badge}
          ${isPending && !isUpdating ? "cursor-pointer active:scale-95" : "cursor-default opacity-80"}`}
      >
        {isUpdating ? (
          <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <span className={`h-2 w-2 rounded-full shrink-0 ${m.dot}`} />
        )}
        <span>{m.label}</span>
        {isPending && !isUpdating && <IcoChevron className="h-3.5 w-3.5 opacity-50 ml-0.5" />}
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ position: "fixed", bottom: pos.bottom, left: pos.left, zIndex: 9999 }}
          className="w-44 overflow-hidden rounded-2xl bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.18)] ring-1 ring-black/10"
        >
          <div className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-bold tracking-[0.2em] text-slate-400">
            CHANGE STATUS
          </div>
          <button
            onClick={() => { setOpen(false); onApprove(farm); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 active:bg-emerald-100"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
              <IcoCheck className="h-3.5 w-3.5" />
            </span>
            Approve
          </button>
          <button
            onClick={() => { setOpen(false); onReject(farm); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 active:bg-rose-100"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100">
              <IcoX className="h-3.5 w-3.5" />
            </span>
            Reject
          </button>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   METRIC CARD
══════════════════════════════════════════ */
function MetricCard({ label, value, sub, accentValue }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
      <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">{label}</p>
      <p className={`mt-2 text-2xl sm:text-3xl font-bold ${accentValue ? "text-[var(--rv-accent)]" : "text-[var(--rv-ink)]"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--rv-muted)] hidden sm:block">{sub}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   SEARCH INPUT
══════════════════════════════════════════ */
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <IcoSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl bg-slate-50 pl-10 pr-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400
                   focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--rv-accent)] transition"
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   PENDING FARM CARD (mobile)
══════════════════════════════════════════ */
function PendingFarmCard({ farm, onApprove, onReject, onView, isUpdating, rowErr }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100 rounded-t-2xl overflow-hidden">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--rv-ink)] truncate">{farm.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <FarmCode code={farm.farm_code} id={farm.id} />
          </div>
        </div>
        <button
          onClick={() => onView(farm)}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 active:scale-95 transition"
        >
          <IcoEye className="h-3.5 w-3.5" /> View
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Owner</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{farm.owner_name || "—"}</p>
          <p className="text-[11px] text-[var(--rv-muted)]">ID: {farm.owner_id}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Location</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{farm.district_code || "—"}</p>
          <p className="text-[11px] text-[var(--rv-muted)]">{farm.state_code}, {farm.country_code}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Area</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">
            {farm.total_area ? `${farm.total_area} ac` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Water Source</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{farm.water_source || "—"}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Submitted</p>
          <p className="mt-0.5 text-xs text-[var(--rv-muted)]">
            {farm.created_at ? new Date(farm.created_at).toLocaleString() : "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/60 rounded-b-2xl">
        <p className="text-[11px] text-[var(--rv-muted)]">Change status:</p>
        <StatusDropdown farm={farm} onApprove={onApprove} onReject={onReject} isUpdating={isUpdating} />
      </div>

      {rowErr && (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-600 rounded-b-2xl">
          ⚠ {rowErr}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   APPROVED FARM CARD (mobile)
══════════════════════════════════════════ */
function ApprovedFarmCard({ farm, onView, onQR, qrReady }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--rv-ink)] truncate">{farm.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <FarmCode code={farm.farm_code} id={farm.id} />
            <StatusBadge status="approved" />
          </div>
        </div>
        <button
          onClick={() => onView(farm)}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 active:scale-95 transition"
        >
          <IcoEye className="h-3.5 w-3.5" /> View
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Owner</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{farm.owner_name || "—"}</p>
          <p className="text-[11px] text-[var(--rv-muted)]">ID: {farm.owner_id}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Location</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{farm.district_code || "—"}</p>
          <p className="text-[11px] text-[var(--rv-muted)]">{farm.state_code}, {farm.country_code}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Area</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">
            {farm.total_area ? `${farm.total_area} ac` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Ponds</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{farm.pond_count ?? "—"}</p>
        </div>
        <div className="col-span-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Approved On</p>
            <p className="mt-0.5 text-xs text-[var(--rv-muted)]">
              {farm.updated_at ? new Date(farm.updated_at).toLocaleDateString() : "—"}
            </p>
          </div>
          <button
            onClick={() => onQR(farm)}
            disabled={!qrReady}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition active:scale-95
              ${qrReady
                ? "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100"
                : "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"}`}
          >
            {qrReady
              ? <IcoQr className="h-3.5 w-3.5" />
              : <span className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-slate-400 animate-spin" />}
            QR
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   QR MODAL
══════════════════════════════════════════ */
function QRModal({ farm, qrDataUrl, onClose }) {
  useEffect(() => {
    if (!farm) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [farm]);

  if (!farm) return null;

  const encodedRows = [
    ["Name",     farm.name],
    ["Code",     farm.farm_code],
    ["Owner",    `${farm.owner_name} (ID: ${farm.owner_id})`],
    ["Address",  farm.farm_address || "N/A"],
    ["District", farm.district_code],
    ["State",    farm.state_code],
    ["Country",  farm.country_code],
    ["Area",     farm.total_area ? `${farm.total_area} acres` : "N/A"],
    ["Ponds",    String(farm.pond_count ?? "N/A")],
    ["Water",    farm.water_source || "N/A"],
    ["Lat/Lng",  `${farm.latitude}, ${farm.longitude}`],
    ["Status",   farm.status],
    ["Approved", farm.updated_at ? new Date(farm.updated_at).toLocaleDateString("en-IN") : "N/A"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--rv-ink)] truncate">{farm.name}</p>
            <p className="text-xs text-[var(--rv-muted)] mt-0.5 font-mono">{farm.farm_code}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-3 rounded-xl bg-slate-100 p-2 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition active:scale-95"
          >
            <IcoX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-5">

          {/* QR image */}
          <div className="flex justify-center">
            {qrDataUrl ? (
              <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-3 shadow-inner">
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${farm.farm_code}`}
                  className="w-64 h-64 rounded-lg"
                />
              </div>
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <span className="h-8 w-8 rounded-full border-[3px] border-slate-200 border-t-[var(--rv-accent)] animate-spin" />
              </div>
            )}
          </div>

          {/* Encoded details preview */}
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase mb-3">
              Encoded in QR — scan to see all fields
            </p>
            <div className="space-y-2">
              {encodedRows.map(([label, val]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <span className="w-16 shrink-0 text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                    {label}
                  </span>
                  <span className="text-xs text-[var(--rv-ink)] break-all">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-4 flex gap-2 bg-slate-50/60">
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`${farm.farm_code}-qr.png`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
              style={{ background: "var(--rv-accent)" }}
            >
              <IcoDownload className="h-4 w-4" />
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DETAIL MODAL
══════════════════════════════════════════ */
function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)] break-words">{value || "—"}</p>
    </div>
  );
}

function FarmDetailModal({ farm, onClose }) {
  useEffect(() => {
    if (!farm) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [farm]);

  if (!farm) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex flex-col h-full
                      md:h-auto md:m-auto md:max-h-[90vh] md:w-full md:max-w-2xl
                      bg-white shadow-2xl overflow-hidden
                      md:rounded-2xl md:ring-1 md:ring-black/10">

        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 shrink-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
               style={{ background: "var(--rv-accent)" }}>
            <IcoFarm className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[var(--rv-ink)]">{farm.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <FarmCode code={farm.farm_code} id={farm.id} />
              <StatusBadge status={farm.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition active:scale-95"
          >
            <IcoX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Owner & Identity</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Owner Name"    value={farm.owner_name} />
              <DetailRow label="Owner ID"      value={farm.owner_id} />
              <DetailRow label="Farm Code"     value={farm.farm_code} />
              <DetailRow label="Location Code" value={farm.location_code} />
              <DetailRow label="District Code" value={farm.district_code} />
              <DetailRow label="State Code"    value={farm.state_code} />
            </div>
          </section>

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Farm Details</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Total Area"   value={farm.total_area ? `${farm.total_area} acres` : null} />
              <DetailRow label="Pond Count"   value={farm.pond_count} />
              <DetailRow label="Water Source" value={farm.water_source} />
              <DetailRow label="Address"      value={farm.farm_address} />
              <DetailRow label="Country"      value={farm.country_code} />
            </div>
          </section>

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Coordinates</p>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <IcoMap className="h-5 w-5 shrink-0 text-slate-400" />
              <span className="flex-1 font-mono text-sm text-[var(--rv-ink)] break-all">
                {farm.latitude}, {farm.longitude}
              </span>
              {farm.latitude && farm.longitude && (
                <a href={`https://maps.google.com/?q=${farm.latitude},${farm.longitude}`}
                   target="_blank" rel="noreferrer"
                   className="shrink-0 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-200 transition">
                  Maps ↗
                </a>
              )}
            </div>
          </section>

          {farm.image_url && (
            <section>
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Farm Gate Image</p>
              <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-50 max-h-56 flex items-center justify-center">
                <img src={farm.image_url} alt="Farm gate" className="w-full object-cover" />
              </div>
            </section>
          )}

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Timestamps</p>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Created" value={farm.created_at ? new Date(farm.created_at).toLocaleString() : null} />
              <DetailRow label="Updated" value={farm.updated_at ? new Date(farm.updated_at).toLocaleString() : null} />
            </div>
          </section>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-5 py-4 bg-slate-50/60">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION WRAPPER
══════════════════════════════════════════ */
function Section({ icon, title, sub, count, accentCount, search, onSearch, searchPlaceholder, children, footer }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_4px_16px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                 style={{ background: "var(--rv-accent)" }}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[var(--rv-ink)]">{title}</span>
                {count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${!accentCount ? "bg-slate-400" : ""}`}
                    style={accentCount ? { background: "var(--rv-accent)" } : undefined}
                  >
                    {count}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--rv-muted)]">{sub}</p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} />
          </div>
        </div>
      </div>

      {children}

      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-[var(--rv-muted)]">
          {footer}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function FarmPondApproval() {
  const dispatch = useDispatch();

  const pendingFarms  = useSelector(selectPendingFarms);
  const approvedFarms = useSelector(selectApprovedFarms);
  const loading       = useSelector(selectFarmsLoading);
  const error         = useSelector(selectFarmsError);
  const updatingMap   = useSelector((s) => s.farmApproval.updating);
  const updateErrMap  = useSelector((s) => s.farmApproval.updateError);

  const [viewFarm,  setViewFarm]  = useState(null);
  const [pendingQ,  setPendingQ]  = useState("");
  const [approvedQ, setApprovedQ] = useState("");
  const [qrMap,     setQrMap]     = useState({});   // farmId → dataURL
  const [qrFarm,    setQrFarm]    = useState(null);

  useEffect(() => { dispatch(fetchAllFarms()); }, [dispatch]);

  /**
   * ── QR GENERATION ──────────────────────────────────────────
   * KEY FIX: No `qrMap[farm.id]` skip check here.
   * Previously that check caused stale QRs (only farm_code) to
   * persist if the component had run before with the old payload.
   * Now it always regenerates the full-detail QR on each
   * approvedFarms change. errorCorrectionLevel "L" maximises
   * data capacity so the full payload fits reliably.
   * ───────────────────────────────────────────────────────────
   */
  useEffect(() => {
    if (!approvedFarms.length) return;

    approvedFarms.forEach(async (farm) => {
      if (!farm.farm_code) return;
      try {
        const payload = buildQrPayload(farm);
        const url = await QRCode.toDataURL(payload, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: "L",   // L = lowest ECC, highest data capacity
          color: { dark: "#0F172A", light: "#FFFFFF" },
        });
        setQrMap((prev) => ({ ...prev, [farm.id]: url }));
      } catch (err) {
        console.error("QR generation failed for", farm.farm_code, err);
      }
    });
  }, [approvedFarms]);

  const handleApprove = (farm) => dispatch(approveFarm({ id: farm.id, farm }));
  const handleReject  = (farm) => dispatch(rejectFarm({ id: farm.id, farm }));

  function filterFarms(list, q) {
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter((f) =>
      [f.name, f.owner_name, f.farm_code, f.farm_address, f.district_code, f.state_code, f.water_source]
        .filter(Boolean).join(" ").toLowerCase().includes(qq)
    );
  }

  const visPending  = useMemo(() => filterFarms(pendingFarms,  pendingQ),  [pendingFarms,  pendingQ]);
  const visApproved = useMemo(() => filterFarms(approvedFarms, approvedQ), [approvedFarms, approvedQ]);

  return (
    <div className="rvFarmApproval min-h-full">
      <style>{`
        .rvFarmApproval {
          --rv-accent: #25B7FF;
          --rv-bg: #EEF2F7;
          --rv-ink: #0F172A;
          --rv-muted: #64748B;
          background: var(--rv-bg);
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-5 sm:space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--rv-ink)] sm:text-3xl">Farm Approval</h1>
            <p className="mt-1 text-sm text-[var(--rv-muted)]">Review and approve farm registrations</p>
          </div>
          <button
            onClick={() => dispatch(fetchAllFarms())}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition disabled:opacity-60 active:scale-95 shadow-sm"
          >
            <IcoRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
            <span>⚠ {error}</span>
            <button onClick={() => dispatch(clearError())}
                    className="shrink-0 rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold hover:bg-rose-200 transition">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Metrics ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <MetricCard label="Pending"  value={pendingFarms.length}  sub="Awaiting review" accentValue />
          <MetricCard label="Approved" value={approvedFarms.length} sub="Active farms" />
          <MetricCard label="Total"    value={pendingFarms.length + approvedFarms.length} sub="All farms" />
        </div>

        {/* ══ PENDING SECTION ══ */}
        <Section
          icon={<IcoFarm className="h-5 w-5" />}
          title="Pending Approval"
          sub="Tap status button to approve or reject"
          count={pendingFarms.length}
          accentCount
          search={pendingQ}
          onSearch={setPendingQ}
          searchPlaceholder="Search pending farms…"
          footer={<>Showing <strong className="text-[var(--rv-ink)]">{visPending.length}</strong> of <strong className="text-[var(--rv-ink)]">{pendingFarms.length}</strong> pending farms</>}
        >
          {loading && pendingFarms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--rv-muted)]">
              <span className="h-8 w-8 rounded-full border-[3px] border-slate-200 border-t-[var(--rv-accent)] animate-spin" />
              <span className="text-sm">Loading farms…</span>
            </div>
          ) : visPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <IcoFarm className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-[var(--rv-ink)]">No pending farms</p>
              <p className="text-xs text-[var(--rv-muted)]">
                {pendingQ ? "Try a different search term." : "All caught up — nothing to review!"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-3 p-4 lg:hidden">
                {visPending.map((farm) => (
                  <PendingFarmCard
                    key={farm.id}
                    farm={farm}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onView={setViewFarm}
                    isUpdating={!!updatingMap[farm.id]}
                    rowErr={updateErrMap[farm.id]}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                      {["Farm Name", "Owner", "Location", "Area", "Water Source", "Submitted", "Status", ""].map((h) => (
                        <th key={h} className={`border-b border-slate-100 px-4 py-3 text-left font-semibold ${h === "" ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visPending.map((farm) => {
                      const isUpdating = !!updatingMap[farm.id];
                      const rowErr = updateErrMap[farm.id];
                      return (
                        <React.Fragment key={farm.id}>
                          <tr className="group hover:bg-slate-50/70 transition">
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <p className="font-semibold text-[var(--rv-ink)]">{farm.name}</p>
                              {farm.farm_code && <div className="mt-1"><FarmCode code={farm.farm_code} id={farm.id} /></div>}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <p className="font-medium text-[var(--rv-ink)]">{farm.owner_name || "—"}</p>
                              <p className="text-xs text-[var(--rv-muted)]">ID: {farm.owner_id}</p>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <p className="text-[var(--rv-ink)]">{farm.district_code || "—"}</p>
                              <p className="text-xs text-[var(--rv-muted)]">{farm.state_code}, {farm.country_code}</p>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap">
                              {farm.total_area ? `${farm.total_area} ac` : "—"}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              {farm.water_source || "—"}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap text-xs text-[var(--rv-muted)]">
                              {farm.created_at ? new Date(farm.created_at).toLocaleDateString() : "—"}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <StatusDropdown farm={farm} onApprove={handleApprove} onReject={handleReject} isUpdating={isUpdating} />
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle text-right">
                              <button
                                onClick={() => setViewFarm(farm)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition"
                              >
                                <IcoEye className="h-3.5 w-3.5" /> View
                              </button>
                            </td>
                          </tr>
                          {rowErr && (
                            <tr>
                              <td colSpan={8} className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-600">
                                ⚠ {rowErr}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Section>

        {/* ══ APPROVED SECTION ══ */}
        <Section
          icon={<IcoCheck className="h-5 w-5" />}
          title="Approved Farms"
          sub="All registered and active farms"
          count={approvedFarms.length}
          search={approvedQ}
          onSearch={setApprovedQ}
          searchPlaceholder="Search approved farms…"
          footer={<>Showing <strong className="text-[var(--rv-ink)]">{visApproved.length}</strong> of <strong className="text-[var(--rv-ink)]">{approvedFarms.length}</strong> approved farms</>}
        >
          {visApproved.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <IcoCheck className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-[var(--rv-ink)]">No approved farms</p>
              <p className="text-xs text-[var(--rv-muted)]">
                {approvedQ ? "Try a different search term." : "Approve a pending farm above."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-3 p-4 lg:hidden">
                {visApproved.map((farm) => (
                  <ApprovedFarmCard
                    key={farm.id}
                    farm={farm}
                    onView={setViewFarm}
                    onQR={setQrFarm}
                    qrReady={!!qrMap[farm.id]}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                      {["Farm Code", "Farm Name", "Owner", "Location", "Area", "Ponds", "QR Code", ""].map((h) => (
                        <th key={h} className={`border-b border-slate-100 px-4 py-3 text-left font-semibold ${h === "" ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visApproved.map((farm) => {
                      const qrReady = !!qrMap[farm.id];
                      return (
                        <tr key={farm.id} className="hover:bg-slate-50/70 transition">
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <FarmCode code={farm.farm_code} id={farm.id} />
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle font-semibold text-[var(--rv-ink)]">
                            {farm.name}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <p className="font-medium text-[var(--rv-ink)]">{farm.owner_name || "—"}</p>
                            <p className="text-xs text-[var(--rv-muted)]">ID: {farm.owner_id}</p>
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <p className="text-[var(--rv-ink)]">{farm.district_code || "—"}</p>
                            <p className="text-xs text-[var(--rv-muted)]">{farm.state_code}, {farm.country_code}</p>
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap">
                            {farm.total_area ? `${farm.total_area} ac` : "—"}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            {farm.pond_count ?? "—"}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <button
                              onClick={() => qrReady && setQrFarm(farm)}
                              disabled={!qrReady}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ring-1 transition
                                ${qrReady
                                  ? "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100 active:scale-95"
                                  : "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"}`}
                            >
                              {qrReady
                                ? <IcoQr className="h-3.5 w-3.5" />
                                : <span className="h-3 w-3 rounded-full border-2 border-slate-300 border-t-slate-400 animate-spin" />}
                              {qrReady ? "View QR" : "Generating…"}
                            </button>
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle text-right">
                            <button
                              onClick={() => setViewFarm(farm)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition"
                            >
                              <IcoEye className="h-3.5 w-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Section>
      </div>

      {/* ── Modals ── */}
      <FarmDetailModal farm={viewFarm} onClose={() => setViewFarm(null)} />
      <QRModal farm={qrFarm} qrDataUrl={qrMap[qrFarm?.id]} onClose={() => setQrFarm(null)} />
    </div>
  );
}