// src/modules/admin/aquaculture/pages/PondApproval.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllPonds,
  approvePond,
  updatePond,
} from "../../../redux/action/pondApprovalActions";

import {
  selectPendingPonds,
  selectApprovedPonds,
  selectPondsLoading,
  selectPondsError,
  clearError,
} from "../../../redux/reducer/pondApprovalSlice";

const ACCENT = "#25B7FF";
const PAGE_SIZE = 10;

/* ── Icons ── */
const Ico = ({ d, ...p }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    stroke="currentColor"
    {...p}
  >
    <path d={d} />
  </svg>
);

const IcoRefresh = (p) => (
  <Ico
    d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16l2.26 2.26A9.75 9.75 0 0 0 12 21a9 9 0 0 0 9-9"
    {...p}
  />
);

const IcoSearch = (p) => (
  <Ico d="M21 21l-4.3-4.3M11 18A7 7 0 1 0 4 11a7 7 0 0 0 7 7Z" {...p} />
);

const IcoCheck = (p) => <Ico d="M20 6 9 17l-5-5" {...p} />;
const IcoX = (p) => <Ico d="M18 6 6 18M6 6l12 12" {...p} />;
const IcoChevronL = (p) => <Ico d="m15 18-6-6 6-6" {...p} />;
const IcoChevronR = (p) => <Ico d="m9 18 6-6-6-6" {...p} />;
const IcoChevronD = (p) => <Ico d="m6 9 6 6 6-6" {...p} />;

const IcoEye = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IcoPond = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    stroke="currentColor"
    {...p}
  >
    <ellipse cx="12" cy="12" rx="10" ry="5" />
    <path d="M2 12c0 4 4.5 7 10 7s10-3 10-7" />
    <path d="M8 10c1-1.5 2-2 4-2s3 .5 4 2" />
  </svg>
);

const IcoMapPin = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

/* ── Generic fixed-position dropdown ── */
function StatusDropdown({ value, options, onChange, isUpdating, disabled }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ bottom: 0, left: 0 });
  const btnRef = useRef();
  const menuRef = useRef();

  useEffect(() => {
    if (!open) return;

    const h = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
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

  function toggle() {
    if (isUpdating || disabled) return;

    const r = btnRef.current.getBoundingClientRect();

    setPos({
      bottom: window.innerHeight - r.top + 6,
      left: r.left,
    });

    setOpen((v) => !v);
  }

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        disabled={isUpdating || disabled}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition select-none
          ${current.cls}
          ${
            !isUpdating && !disabled
              ? "cursor-pointer active:scale-95"
              : "cursor-default opacity-80"
          }`}
      >
        {isUpdating ? (
          <span className="h-2.5 w-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
        )}

        {current.label}

        {!isUpdating && !disabled && (
          <IcoChevronD className="h-3 w-3 opacity-50" />
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            bottom: pos.bottom,
            left: pos.left,
            zIndex: 9999,
          }}
          className="w-44 overflow-hidden rounded-2xl bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.18)] ring-1 ring-black/10"
        >
          <div className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-bold tracking-[0.2em] text-slate-400">
            CHANGE STATUS
          </div>

          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setOpen(false);
                if (opt.value !== value) onChange(opt.value);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition
                ${
                  opt.value === value
                    ? "bg-slate-50 opacity-60 cursor-default"
                    : "hover:bg-slate-50"
                }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg ${opt.iconBg}`}
              >
                {opt.icon}
              </span>

              <span className={opt.textCls}>{opt.label}</span>

              {opt.value === value && (
                <IcoCheck className="ml-auto h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Verify dropdown options ── */
const VERIFY_OPTIONS = [
  {
    value: "verified",
    label: "Verified",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    iconBg: "bg-emerald-100",
    textCls: "text-emerald-700",
    icon: <IcoCheck className="h-3.5 w-3.5 text-emerald-700" />,
  },
  {
    value: "unverified",
    label: "Unverified",
    cls: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-400",
    iconBg: "bg-amber-100",
    textCls: "text-amber-700",
    icon: <IcoChevronD className="h-3.5 w-3.5 text-amber-700" />,
  },
];

/* ── Active dropdown options ── */
const ACTIVE_OPTIONS = [
  {
    value: "active",
    label: "Active",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    iconBg: "bg-emerald-100",
    textCls: "text-emerald-700",
    icon: <IcoCheck className="h-3.5 w-3.5 text-emerald-700" />,
  },
  {
    value: "inactive",
    label: "Inactive",
    cls: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
    iconBg: "bg-slate-200",
    textCls: "text-slate-600",
    icon: <IcoX className="h-3.5 w-3.5 text-slate-500" />,
  },
];

/* ── Pagination ── */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);

    if (current > 3) pages.push("…");

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) pages.push("…");

    pages.push(total);
  }

  const btn =
    "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-semibold transition";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <IcoChevronL className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`e${i}`}
            className="flex h-8 w-8 items-center justify-center text-slate-400 text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`${btn} ${
              current === p
                ? "text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            style={current === p ? { background: ACCENT } : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${btn} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <IcoChevronR className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── Detail Modal ── */
function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-800 break-words">
        {value ?? "—"}
      </p>
    </div>
  );
}

function PondDetailModal({ pond, onClose }) {
  useEffect(() => {
    if (!pond) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [pond]);

  if (!pond) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 flex flex-col h-full
        md:h-auto md:m-auto md:max-h-[90vh] md:w-full md:max-w-2xl
        bg-white shadow-2xl overflow-hidden
        md:rounded-2xl md:ring-1 md:ring-black/10"
      >
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 shrink-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: ACCENT }}
          >
            <IcoPond className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-800">{pond.name}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              {pond.pond_code || `#${pond.id}`}
            </p>
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
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Pond Identity
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Pond Name" value={pond.name} />
              <DetailRow label="Pond Code" value={pond.pond_code} />
              <DetailRow label="Pond ID" value={pond.id} />
              <DetailRow label="User ID" value={pond.user_id} />
              <DetailRow label="Pond Type" value={pond.pond_type} />
            </div>
          </section>

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Farm Details
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Farm ID" value={pond.farm_id} />
              <DetailRow label="Farm Name" value={pond.farm_name} />
              <DetailRow label="Farm QR ID" value={pond.farm_qr_id} />
              <DetailRow label="Species ID" value={pond.species_id} />
            </div>
          </section>

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Measurements
            </p>

            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                label="Water Spread Area"
                value={pond.area ? `${pond.area} acres` : null}
              />
              <DetailRow
                label="Volume"
                value={pond.volume ? `${pond.volume}` : null}
              />
            </div>
          </section>

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Status
            </p>

            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Verification" value={pond.status} />
              <DetailRow
                label="Active Status"
                value={pond.is_active ? "Active" : "Inactive"}
              />
            </div>
          </section>

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Location
            </p>

            {pond.pond_gps ? (
              <a
                href={pond.pond_gps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100 transition"
              >
                <IcoMapPin className="h-4 w-4 shrink-0" />
                View on Google Maps
              </a>
            ) : (
              <p className="text-sm text-slate-400">No GPS data available</p>
            )}
          </section>

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

          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">
              Timestamps
            </p>

            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                label="Created"
                value={pond.created_at ? new Date(pond.created_at).toLocaleString() : null}
              />
              <DetailRow
                label="Updated"
                value={pond.updated_at ? new Date(pond.updated_at).toLocaleString() : null}
              />
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

/* ── Table card wrapper ── */
function TableCard({
  icon,
  title,
  count,
  loading,
  search,
  onSearch,
  onRefresh,
  children,
  footer,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: ACCENT }}
          >
            {icon}
          </div>

          <div>
            <p className="font-semibold text-slate-800">{title}</p>
            <p className="text-xs text-slate-500">
              {count !== undefined
                ? `${count} pond${count !== 1 ? "s" : ""}`
                : "Loading…"}
            </p>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition disabled:opacity-40"
            >
              <IcoRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>

        <div className="relative">
          <IcoSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name, code, farm ID…"
            className="h-9 w-full sm:w-64 rounded-xl bg-slate-50 pl-9 pr-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:outline-none transition"
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${ACCENT}55`;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "";
            }}
          />
        </div>
      </div>

      {children}
      {footer}
    </div>
  );
}

function Empty({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <IcoPond className="h-6 w-6 text-slate-400" />
      </div>

      <p className="text-sm font-semibold text-slate-700">No ponds found</p>
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}

function TableFooter({ page, totalPages, filtered, pageSize, onPageChange }) {
  const from = filtered === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filtered);

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing <strong className="text-slate-700">{from}–{to}</strong> of{" "}
        <strong className="text-slate-700">{filtered}</strong> pond(s)
      </p>

      <Pagination current={page} total={totalPages} onChange={onPageChange} />
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function PondApproval() {
  const dispatch = useDispatch();

  const pendingPonds = useSelector(selectPendingPonds);
  const approvedPonds = useSelector(selectApprovedPonds);
  const loading = useSelector(selectPondsLoading);
  const error = useSelector(selectPondsError);
  const updatingMap = useSelector((s) => s.pondApproval.updating);
  const updateErrMap = useSelector((s) => s.pondApproval.updateError);

  const [viewPond, setViewPond] = useState(null);
  const [uSearch, setUSearch] = useState("");
  const [vSearch, setVSearch] = useState("");
  const [uPage, setUPage] = useState(1);
  const [vPage, setVPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllPonds());
  }, [dispatch]);

  useEffect(() => {
    setUPage(1);
  }, [uSearch]);

  useEffect(() => {
    setVPage(1);
  }, [vSearch]);

  function handleVerifyChange(pond, newStatus) {
    if (newStatus === "verified") {
      dispatch(approvePond({ id: pond.id, pond }));
    }

    if (newStatus === "unverified") {
      dispatch(
        updatePond({
          id: pond.id,
          pond,
          overrides: { verification_status: "Unverified" },
        })
      );
    }
  }

  function handleActiveChange(pond, newActive) {
    dispatch(
      updatePond({
        id: pond.id,
        pond,
        overrides: {
          pond_status: newActive === "active" ? "Active" : "Inactive",
        },
      })
    );
  }

  function filterPonds(list, q) {
    const qq = q.trim().toLowerCase();

    if (!qq) return list;

    return list.filter((p) =>
      [p.name, p.pond_code, String(p.farm_id ?? ""), String(p.species_id ?? "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(qq)
    );
  }

  const filteredU = useMemo(
    () => filterPonds(pendingPonds, uSearch),
    [pendingPonds, uSearch]
  );

  const filteredV = useMemo(
    () => filterPonds(approvedPonds, vSearch),
    [approvedPonds, vSearch]
  );

  const uPages = Math.max(1, Math.ceil(filteredU.length / PAGE_SIZE));
  const vPages = Math.max(1, Math.ceil(filteredV.length / PAGE_SIZE));

  const uSafe = Math.min(uPage, uPages);
  const vSafe = Math.min(vPage, vPages);

  const pageU = filteredU.slice((uSafe - 1) * PAGE_SIZE, uSafe * PAGE_SIZE);
  const pageV = filteredV.slice((vSafe - 1) * PAGE_SIZE, vSafe * PAGE_SIZE);

  const COLS_U = [
    "POND CODE",
    "POND NAME",
    "FARM ID",
    "SPECIES ID",
    "AREA",
    "SUBMITTED",
    "VERIFICATION",
    "ACTIONS",
  ];

  const COLS_V = [
    "POND CODE",
    "POND NAME",
    "FARM ID",
    "SPECIES ID",
    "AREA",
    "VERIFICATION",
    "ACTIVE STATUS",
    "ACTIONS",
  ];

  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-slate-100 px-6 pt-6 pb-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-2">
          <IcoPond className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          Aquaculture
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-800">Pond Registry</h1>

        <p className="mt-0.5 text-sm text-slate-500">
          Verify ponds and manage their active status
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          <span>⚠ {error}</span>

          <button
            onClick={() => dispatch(clearError())}
            className="shrink-0 rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold hover:bg-rose-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mx-6 my-5 space-y-6">
        {/* ══ UNVERIFIED TABLE ══ */}
        <TableCard
          icon={<IcoPond className="h-5 w-5" />}
          title="Unverified Ponds"
          count={pendingPonds.length}
          loading={loading}
          search={uSearch}
          onSearch={setUSearch}
          onRefresh={() => dispatch(fetchAllPonds())}
          footer={
            filteredU.length > 0 && (
              <TableFooter
                page={uSafe}
                totalPages={uPages}
                filtered={filteredU.length}
                pageSize={PAGE_SIZE}
                onPageChange={setUPage}
              />
            )
          }
        >
          {loading && pendingPonds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
              <span
                className="h-7 w-7 rounded-full border-[3px] border-slate-200 animate-spin"
                style={{ borderTopColor: ACCENT }}
              />
              <span className="text-sm">Loading ponds…</span>
            </div>
          ) : filteredU.length === 0 ? (
            <Empty
              message={uSearch ? "Try a different search term." : "All ponds are verified!"}
            />
          ) : (
            <>
              {/* Mobile */}
              <div className="sm:hidden divide-y divide-slate-100">
                {pageU.map((pond) => (
                  <div key={pond.id} className="px-4 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {pond.name || "—"}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                          {pond.pond_code || `#${pond.id}`}
                        </p>
                      </div>

                      <button
                        onClick={() => setViewPond(pond)}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ background: ACCENT }}
                      >
                        <IcoEye className="h-3.5 w-3.5" /> View
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div>
                        <span className="text-slate-400">Farm: </span>
                        <span className="text-slate-700">{pond.farm_id ?? "—"}</span>
                      </div>

                      <div>
                        <span className="text-slate-400">Species: </span>
                        <span className="text-slate-700">{pond.species_id ?? "—"}</span>
                      </div>

                      <div>
                        <span className="text-slate-400">Area: </span>
                        <span className="text-slate-700">
                          {pond.area ? `${pond.area} ac` : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Verification:</span>

                      <StatusDropdown
                        value="unverified"
                        options={VERIFY_OPTIONS}
                        onChange={(v) => handleVerifyChange(pond, v)}
                        isUpdating={!!updatingMap[pond.id]}
                      />
                    </div>

                    {updateErrMap[pond.id] && (
                      <p className="text-xs text-rose-600">
                        ⚠ {updateErrMap[pond.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {COLS_U.map((h) => (
                        <th
                          key={h}
                          className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-[10px] font-bold tracking-[0.18em] text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pageU.map((pond) => (
                      <React.Fragment key={pond.id}>
                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg ring-1 ring-slate-200/80 whitespace-nowrap">
                              {pond.pond_code || `#${pond.id}`}
                            </span>
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle font-semibold text-slate-800">
                            {pond.name || "—"}
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

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap text-slate-700">
                            {pond.area ? `${pond.area} ac` : "—"}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap text-xs text-slate-500">
                            {pond.created_at
                              ? new Date(pond.created_at).toLocaleDateString()
                              : "—"}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <StatusDropdown
                              value="unverified"
                              options={VERIFY_OPTIONS}
                              onChange={(v) => handleVerifyChange(pond, v)}
                              isUpdating={!!updatingMap[pond.id]}
                            />
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <button
                              onClick={() => setViewPond(pond)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                              style={{ background: ACCENT }}
                            >
                              <IcoEye className="h-3.5 w-3.5" /> View
                            </button>
                          </td>
                        </tr>

                        {updateErrMap[pond.id] && (
                          <tr>
                            <td
                              colSpan={8}
                              className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-600"
                            >
                              ⚠ {updateErrMap[pond.id]}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </TableCard>

        {/* ══ VERIFIED TABLE ══ */}
        <TableCard
          icon={<IcoCheck className="h-5 w-5" />}
          title="Verified Ponds"
          count={approvedPonds.length}
          loading={false}
          search={vSearch}
          onSearch={setVSearch}
          footer={
            filteredV.length > 0 && (
              <TableFooter
                page={vSafe}
                totalPages={vPages}
                filtered={filteredV.length}
                pageSize={PAGE_SIZE}
                onPageChange={setVPage}
              />
            )
          }
        >
          {filteredV.length === 0 ? (
            <Empty
              message={vSearch ? "Try a different search term." : "No verified ponds yet."}
            />
          ) : (
            <>
              {/* Mobile */}
              <div className="sm:hidden divide-y divide-slate-100">
                {pageV.map((pond) => (
                  <div key={pond.id} className="px-4 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {pond.name || "—"}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                          {pond.pond_code || `#${pond.id}`}
                        </p>
                      </div>

                      <button
                        onClick={() => setViewPond(pond)}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ background: ACCENT }}
                      >
                        <IcoEye className="h-3.5 w-3.5" /> View
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div>
                        <span className="text-slate-400">Farm: </span>
                        <span className="text-slate-700">{pond.farm_id ?? "—"}</span>
                      </div>

                      <div>
                        <span className="text-slate-400">Species: </span>
                        <span className="text-slate-700">{pond.species_id ?? "—"}</span>
                      </div>

                      <div>
                        <span className="text-slate-400">Area: </span>
                        <span className="text-slate-700">
                          {pond.area ? `${pond.area} ac` : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Verification:</span>

                        <StatusDropdown
                          value="verified"
                          options={VERIFY_OPTIONS}
                          onChange={(v) => handleVerifyChange(pond, v)}
                          isUpdating={!!updatingMap[pond.id]}
                          disabled={true}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Active:</span>

                        <StatusDropdown
                          value={pond.is_active !== false ? "active" : "inactive"}
                          options={ACTIVE_OPTIONS}
                          onChange={(v) => handleActiveChange(pond, v)}
                          isUpdating={!!updatingMap[pond.id]}
                        />
                      </div>
                    </div>

                    {updateErrMap[pond.id] && (
                      <p className="text-xs text-rose-600">
                        ⚠ {updateErrMap[pond.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {COLS_V.map((h) => (
                        <th
                          key={h}
                          className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-[10px] font-bold tracking-[0.18em] text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pageV.map((pond) => (
                      <React.Fragment key={pond.id}>
                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg ring-1 ring-slate-200/80 whitespace-nowrap">
                              {pond.pond_code || `#${pond.id}`}
                            </span>
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle font-semibold text-slate-800">
                            {pond.name || "—"}
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

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap text-slate-700">
                            {pond.area ? `${pond.area} ac` : "—"}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <StatusDropdown
                              value="verified"
                              options={VERIFY_OPTIONS}
                              onChange={(v) => handleVerifyChange(pond, v)}
                              isUpdating={!!updatingMap[pond.id]}
                              disabled={true}
                            />
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <StatusDropdown
                              value={pond.is_active !== false ? "active" : "inactive"}
                              options={ACTIVE_OPTIONS}
                              onChange={(v) => handleActiveChange(pond, v)}
                              isUpdating={!!updatingMap[pond.id]}
                            />
                          </td>

                          <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                            <button
                              onClick={() => setViewPond(pond)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                              style={{ background: ACCENT }}
                            >
                              <IcoEye className="h-3.5 w-3.5" /> View
                            </button>
                          </td>
                        </tr>

                        {updateErrMap[pond.id] && (
                          <tr>
                            <td
                              colSpan={8}
                              className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-600"
                            >
                              ⚠ {updateErrMap[pond.id]}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </TableCard>
      </div>

      <PondDetailModal pond={viewPond} onClose={() => setViewPond(null)} />
    </div>
  );
}