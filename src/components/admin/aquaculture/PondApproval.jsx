// src/modules/admin/aquaculture/pages/PondApproval.jsx
/**
 * Pond Approval Page
 * ─────────────────────────────────────────────
 * ✅ GET /api/ponds on mount
 * ✅ Pending table  → status dropdown → PUT /api/ponds/:id
 * ✅ Approved table → read-only
 * ✅ Detail modal   → full pond info popup
 * ✅ Mobile-first: cards on mobile, table on lg+
 * ✅ Redux: pondSlice + pondActions + pondService
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAllPonds, approvePond, rejectPond } from "../../../redux/action/pondApprovalActions";
import {
  selectPendingPonds,
  selectApprovedPonds,
  selectPondsLoading,
  selectPondsError,
  clearError,
} from "../../../redux/reducer/pondApprovalSlice";

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
const SvgIco = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <path d={d} />
  </svg>
);
const IcoCheck   = (p) => <SvgIco d="M20 6 9 17l-5-5" {...p} />;
const IcoX       = (p) => <SvgIco d="M18 6 6 18M6 6l12 12" {...p} />;
const IcoChevron = (p) => <SvgIco d="m6 9 6 6 6-6" {...p} />;
const IcoRefresh = (p) => <SvgIco d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16l2.26 2.26A9.75 9.75 0 0 0 12 21a9 9 0 0 0 9-9" {...p} />;
const IcoSearch  = (p) => <SvgIco d="M21 21l-4.3-4.3M11 18A7 7 0 1 0 4 11a7 7 0 0 0 7 7Z" {...p} />;
const IcoMap     = (p) => <SvgIco d="M12 21S5 13.5 5 9a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" {...p} />;
const IcoPond    = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" stroke="currentColor" {...p}>
    <ellipse cx="12" cy="12" rx="10" ry="5" />
    <path d="M2 12c0 4 4.5 7 10 7s10-3 10-7" />
    <path d="M8 10c1-1.5 2-2 4-2s3 .5 4 2" />
  </svg>
);
const IcoEye     = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoFish    = (p) => <SvgIco d="M6.5 12C6.5 12 4 10 2 10c0 0 2 2 2 2s-2 2-2 2c2 0 4.5-2 4.5-2ZM6.5 12h11M22 8s-2 4-4 4-4-4-4-4M22 16s-2-4-4-4-4 4-4 4" {...p} />;

/* ══════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════ */
const STATUS_META = {
  pending:  { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 ring-amber-200",       label: "Pending"  },
  approved: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Approved" },
  rejected: { dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 ring-rose-200",           label: "Rejected" },
};

/* ══════════════════════════════════════════
   ATOMS
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

function PondCode({ code, id }) {
  return (
    <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 ring-1 ring-slate-200/80">
      {code || `ID-${id}`}
    </span>
  );
}

/* ══════════════════════════════════════════
   STATUS DROPDOWN  (fixed-position — escapes overflow parents)
══════════════════════════════════════════ */
function StatusDropdown({ pond, onApprove, onReject, isUpdating }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef();
  const menuRef = useRef();

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // close on scroll/resize so menu doesn't float away
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [open]);

  function handleToggle() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    // open above the button so it never goes off-screen at the bottom
    setPos({ bottom: window.innerHeight - r.top + 6, left: r.left });
    setOpen((v) => !v);
  }

  const m = STATUS_META[pond.status] ?? STATUS_META.pending;
  const isPending = pond.status === "pending";

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => isPending && !isUpdating && handleToggle()}
        disabled={isUpdating || !isPending}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition select-none
          ${m.badge}
          ${isPending && !isUpdating ? "cursor-pointer active:scale-95" : "cursor-default opacity-80"}
        `}
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
            onClick={() => { setOpen(false); onApprove(pond); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
              <IcoCheck className="h-3.5 w-3.5" />
            </span>
            Approve
          </button>
          <button
            onClick={() => { setOpen(false); onReject(pond); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition"
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
        className="h-10 w-full rounded-xl bg-slate-50 pl-10 pr-4 text-sm text-slate-800 ring-1 ring-slate-200
                   placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--rv-accent)] transition"
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   PENDING POND CARD (mobile)
══════════════════════════════════════════ */
function PendingPondCard({ pond, onApprove, onReject, onView, isUpdating, rowErr }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      {/* header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100 rounded-t-2xl overflow-hidden">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--rv-ink)] truncate">{pond.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <PondCode code={pond.pond_code} id={pond.id} />
          </div>
        </div>
        <button
          onClick={() => onView(pond)}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 active:scale-95 transition"
        >
          <IcoEye className="h-3.5 w-3.5" /> View
        </button>
      </div>

      {/* body */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Farm ID</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{pond.farm_id ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Species ID</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{pond.species_id ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Area</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">
            {pond.area ? `${pond.area} ac` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Pond Code</p>
          <p className="mt-0.5 text-sm font-mono text-[var(--rv-ink)]">{pond.pond_code || "—"}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Submitted</p>
          <p className="mt-0.5 text-xs text-[var(--rv-muted)]">
            {pond.created_at ? new Date(pond.created_at).toLocaleString() : "—"}
          </p>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50/60 rounded-b-2xl">
        <p className="text-[11px] text-[var(--rv-muted)]">Change status:</p>
        <StatusDropdown pond={pond} onApprove={onApprove} onReject={onReject} isUpdating={isUpdating} />
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
   APPROVED POND CARD (mobile)
══════════════════════════════════════════ */
function ApprovedPondCard({ pond, onView }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--rv-ink)] truncate">{pond.name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <PondCode code={pond.pond_code} id={pond.id} />
            <StatusBadge status="approved" />
          </div>
        </div>
        <button
          onClick={() => onView(pond)}
          className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 active:scale-95 transition"
        >
          <IcoEye className="h-3.5 w-3.5" /> View
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Farm ID</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{pond.farm_id ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Species ID</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">{pond.species_id ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Area</p>
          <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)]">
            {pond.area ? `${pond.area} ac` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Approved On</p>
          <p className="mt-0.5 text-xs text-[var(--rv-muted)]">
            {pond.updated_at ? new Date(pond.updated_at).toLocaleDateString() : "—"}
          </p>
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
      <p className="mt-0.5 text-sm font-medium text-[var(--rv-ink)] break-words">{value ?? "—"}</p>
    </div>
  );
}

function PondDetailModal({ pond, onClose }) {
  useEffect(() => {
    if (!pond) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [pond]);

  if (!pond) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex flex-col h-full
                      md:h-auto md:m-auto md:max-h-[90vh] md:w-full md:max-w-2xl
                      bg-white shadow-2xl overflow-hidden
                      md:rounded-2xl md:ring-1 md:ring-black/10">

        {/* header */}
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 shrink-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
               style={{ background: "var(--rv-accent)" }}>
            <IcoPond className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[var(--rv-ink)]">{pond.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <PondCode code={pond.pond_code} id={pond.id} />
              <StatusBadge status={pond.status} />
            </div>
          </div>
          <button onClick={onClose}
                  className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition active:scale-95">
            <IcoX className="h-5 w-5" />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">

          {/* Identity */}
          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Pond Identity
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Pond Name"  value={pond.name} />
              <DetailRow label="Pond Code"  value={pond.pond_code} />
              <DetailRow label="Pond ID"    value={pond.id} />
              <DetailRow label="Farm ID"    value={pond.farm_id} />
              <DetailRow label="Species ID" value={pond.species_id} />
              <DetailRow label="Status"     value={pond.status} />
            </div>
          </section>

          {/* Details */}
          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Pond Details
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Area" value={pond.area ? `${pond.area} acres` : null} />
              <DetailRow label="Image Key" value={pond.image_key} />
            </div>
          </section>

          {/* Image */}
          {pond.image_url && (
            <section>
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
                Pond Image
              </p>
              <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-slate-50 max-h-60 flex items-center justify-center">
                <img src={pond.image_url} alt="Pond" className="w-full object-cover" />
              </div>
            </section>
          )}

          {/* Timestamps */}
          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Timestamps
            </p>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Created" value={pond.created_at ? new Date(pond.created_at).toLocaleString() : null} />
              <DetailRow label="Updated" value={pond.updated_at ? new Date(pond.updated_at).toLocaleString() : null} />
            </div>
          </section>
        </div>

        {/* footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-4 bg-slate-50/60">
          <button onClick={onClose}
                  className="w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition active:scale-[0.98]">
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
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${!accentCount ? "bg-slate-400" : ""}`}
                        style={accentCount ? { background: "var(--rv-accent)" } : undefined}>
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
   EMPTY STATE
══════════════════════════════════════════ */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[var(--rv-ink)]">{title}</p>
      <p className="text-xs text-[var(--rv-muted)]">{sub}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function PondApproval() {
  const dispatch = useDispatch();

  const pendingPonds  = useSelector(selectPendingPonds);
  const approvedPonds = useSelector(selectApprovedPonds);
  const loading       = useSelector(selectPondsLoading);
  const error         = useSelector(selectPondsError);
  const updatingMap   = useSelector((s) => s.pondApproval.updating);
  const updateErrMap  = useSelector((s) => s.pondApproval.updateError);

  const [viewPond,  setViewPond]  = useState(null);
  const [pendingQ,  setPendingQ]  = useState("");
  const [approvedQ, setApprovedQ] = useState("");

  useEffect(() => { dispatch(fetchAllPonds()); }, [dispatch]);

  const handleApprove = (pond) => dispatch(approvePond({ id: pond.id, pond }));
  const handleReject  = (pond) => dispatch(rejectPond({ id: pond.id, pond }));

  function filterPonds(list, q) {
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter((p) =>
      [p.name, p.pond_code, String(p.farm_id ?? ""), String(p.species_id ?? "")]
        .filter(Boolean).join(" ").toLowerCase().includes(qq)
    );
  }

  const visPending  = useMemo(() => filterPonds(pendingPonds,  pendingQ),  [pendingPonds,  pendingQ]);
  const visApproved = useMemo(() => filterPonds(approvedPonds, approvedQ), [approvedPonds, approvedQ]);

  /* ─── Desktop table columns ─── */
  const pendingCols  = ["Pond Name", "Pond Code", "Farm ID", "Species ID", "Area", "Submitted", "Status", ""];
  const approvedCols = ["Pond Code", "Pond Name", "Farm ID", "Species ID", "Area", "Approved On", ""];

  return (
    <div className="rvPondApproval min-h-full">
      <style>{`
        .rvPondApproval {
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
            <h1 className="text-2xl font-bold tracking-tight text-[var(--rv-ink)] sm:text-3xl">
              Pond Approval
            </h1>
            <p className="mt-1 text-sm text-[var(--rv-muted)]">
              Review and approve pond registrations
            </p>
          </div>
          <button
            onClick={() => dispatch(fetchAllPonds())}
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
          <MetricCard label="Pending"  value={pendingPonds.length}  sub="Awaiting review"  accentValue />
          <MetricCard label="Approved" value={approvedPonds.length} sub="Active ponds" />
          <MetricCard label="Total"    value={pendingPonds.length + approvedPonds.length} sub="All ponds" />
        </div>

        {/* ══ PENDING SECTION ══ */}
        <Section
          icon={<IcoPond className="h-5 w-5" />}
          title="Pending Approval"
          sub="Tap status button to approve or reject"
          count={pendingPonds.length}
          accentCount
          search={pendingQ}
          onSearch={setPendingQ}
          searchPlaceholder="Search by name, code, farm ID…"
          footer={
            <>Showing <strong className="text-[var(--rv-ink)]">{visPending.length}</strong> of <strong className="text-[var(--rv-ink)]">{pendingPonds.length}</strong> pending ponds</>
          }
        >
          {loading && pendingPonds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[var(--rv-muted)]">
              <span className="h-8 w-8 rounded-full border-[3px] border-slate-200 border-t-[var(--rv-accent)] animate-spin" />
              <span className="text-sm">Loading ponds…</span>
            </div>
          ) : visPending.length === 0 ? (
            <EmptyState
              icon={<IcoPond className="h-7 w-7 text-slate-400" />}
              title="No pending ponds"
              sub={pendingQ ? "Try a different search term." : "All caught up — nothing to review!"}
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-3 p-4 lg:hidden">
                {visPending.map((pond) => (
                  <PendingPondCard
                    key={pond.id}
                    pond={pond}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onView={setViewPond}
                    isUpdating={!!updatingMap[pond.id]}
                    rowErr={updateErrMap[pond.id]}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                      {pendingCols.map((h) => (
                        <th key={h} className={`border-b border-slate-100 px-4 py-3 text-left font-semibold ${h === "" ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visPending.map((pond) => {
                      const isUpdating = !!updatingMap[pond.id];
                      const rowErr = updateErrMap[pond.id];
                      return (
                        <React.Fragment key={pond.id}>
                          <tr className="hover:bg-slate-50/70 transition">
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <p className="font-semibold text-[var(--rv-ink)]">{pond.name}</p>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <PondCode code={pond.pond_code} id={pond.id} />
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                {pond.farm_id ?? "—"}
                              </span>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                                {pond.species_id ?? "—"}
                              </span>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap">
                              {pond.area ? `${pond.area} ac` : "—"}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap text-xs text-[var(--rv-muted)]">
                              {pond.created_at ? new Date(pond.created_at).toLocaleDateString() : "—"}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                              <StatusDropdown pond={pond} onApprove={handleApprove} onReject={handleReject} isUpdating={isUpdating} />
                            </td>
                            <td className="border-b border-slate-100 px-4 py-3.5 align-middle text-right">
                              <button
                                onClick={() => setViewPond(pond)}
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
          title="Approved Ponds"
          sub="All registered and active ponds"
          count={approvedPonds.length}
          search={approvedQ}
          onSearch={setApprovedQ}
          searchPlaceholder="Search approved ponds…"
          footer={
            <>Showing <strong className="text-[var(--rv-ink)]">{visApproved.length}</strong> of <strong className="text-[var(--rv-ink)]">{approvedPonds.length}</strong> approved ponds</>
          }
        >
          {visApproved.length === 0 ? (
            <EmptyState
              icon={<IcoCheck className="h-7 w-7 text-emerald-400" />}
              title="No approved ponds"
              sub={approvedQ ? "Try a different search term." : "Approve a pending pond above."}
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="flex flex-col gap-3 p-4 lg:hidden">
                {visApproved.map((pond) => (
                  <ApprovedPondCard key={pond.id} pond={pond} onView={setViewPond} />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                      {approvedCols.map((h) => (
                        <th key={h} className={`border-b border-slate-100 px-4 py-3 text-left font-semibold ${h === "" ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visApproved.map((pond) => (
                      <tr key={pond.id} className="hover:bg-slate-50/70 transition">
                        <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                          <PondCode code={pond.pond_code} id={pond.id} />
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5 align-middle font-semibold text-[var(--rv-ink)]">
                          {pond.name}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                          <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                            {pond.farm_id ?? "—"}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                          <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                            {pond.species_id ?? "—"}
                          </span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap">
                          {pond.area ? `${pond.area} ac` : "—"}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap text-xs text-[var(--rv-muted)]">
                          {pond.updated_at ? new Date(pond.updated_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3.5 align-middle text-right">
                          <button
                            onClick={() => setViewPond(pond)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 transition"
                          >
                            <IcoEye className="h-3.5 w-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Section>
      </div>

      <PondDetailModal pond={viewPond} onClose={() => setViewPond(null)} />
    </div>
  );
}