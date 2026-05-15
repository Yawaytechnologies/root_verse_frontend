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

const Ico = ({ d, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    stroke="currentColor"
    {...props}
  >
    <path d={d} />
  </svg>
);

const IcoRefresh = (props) => (
  <Ico
    d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16l2.26 2.26A9.75 9.75 0 0 0 12 21a9 9 0 0 0 9-9"
    {...props}
  />
);

const IcoSearch = (props) => (
  <Ico
    d="M21 21l-4.3-4.3M11 18A7 7 0 1 0 4 11a7 7 0 0 0 7 7Z"
    {...props}
  />
);

const IcoCheck = (props) => <Ico d="M20 6 9 17l-5-5" {...props} />;
const IcoX = (props) => <Ico d="M18 6 6 18M6 6l12 12" {...props} />;
const IcoChevronL = (props) => <Ico d="m15 18-6-6 6-6" {...props} />;
const IcoChevronR = (props) => <Ico d="m9 18 6-6-6-6" {...props} />;
const IcoChevronD = (props) => <Ico d="m6 9 6 6 6-6" {...props} />;

const IcoEye = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    stroke="currentColor"
    {...props}
  >
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IcoPond = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    stroke="currentColor"
    {...props}
  >
    <ellipse cx="12" cy="12" rx="10" ry="5" />
    <path d="M2 12c0 4 4.5 7 10 7s10-3 10-7" />
    <path d="M8 10c1-1.5 2-2 4-2s3 .5 4 2" />
  </svg>
);

const IcoMapPin = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const show = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPondName = (pond) => {
  return pond?.pond_name || pond?.name || "—";
};

const getPondCode = (pond) => {
  return pond?.pond_id || pond?.pond_code || "—";
};

const getPondQr = (pond) => {
  return (
    pond?.qrs_id ||
    pond?.qrs_code ||
    pond?.qrsCode ||
    pond?.qrsID ||
    pond?.pond_qrs ||
    pond?.pond_qrs_id ||
    pond?.pondQr ||
    pond?.pond_qr ||
    pond?.pond_qr_id ||
    pond?.qr_code ||
    pond?.qr_code_id ||
    pond?.qrId ||
    pond?.qr_id ||
    "—"
  );
};

const getPondArea = (pond) => {
  return (
    pond?.water_spread_area_acres ||
    pond?.water_spread_area ||
    pond?.area ||
    ""
  );
};

const getVerificationText = (pond) => {
  const value = pond?.verification_status || pond?.status;

  if (!value) return "—";

  const text = String(value).trim().toLowerCase();

  if (text === "approved" || text === "verified") return "Verified";
  if (text === "pending" || text === "unverified") return "Unverified";
  if (text === "rejected") return "Rejected";

  return String(value);
};

const isPondActive = (pond) => {
  if (pond?.pond_status) {
    return String(pond.pond_status).toLowerCase() === "active";
  }

  return pond?.is_active !== false;
};

function StatusDropdown({ value, options, onChange, isUpdating, disabled }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ bottom: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handler = (event) => {
      if (
        !btnRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
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

  const toggle = () => {
    if (isUpdating || disabled) return;

    const rect = btnRef.current.getBoundingClientRect();

    setPos({
      bottom: window.innerHeight - rect.top + 6,
      left: rect.left,
    });

    setOpen((previous) => !previous);
  };

  const current = options.find((option) => option.value === value) ?? options[0];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={isUpdating || disabled}
        className={`inline-flex select-none items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition ${current.cls} ${
          !isUpdating && !disabled
            ? "cursor-pointer active:scale-95"
            : "cursor-default opacity-80"
        }`}
      >
        {isUpdating ? (
          <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
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

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setOpen(false);
                if (option.value !== value) {
                  onChange(option.value);
                }
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition ${
                option.value === value
                  ? "cursor-default bg-slate-50 opacity-60"
                  : "hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg ${option.iconBg}`}
              >
                {option.icon}
              </span>

              <span className={option.textCls}>{option.label}</span>

              {option.value === value && (
                <IcoCheck className="ml-auto h-3.5 w-3.5 text-slate-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

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

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];

  if (total <= 7) {
    for (let index = 1; index <= total; index += 1) {
      pages.push(index);
    }
  } else {
    pages.push(1);

    if (current > 3) pages.push("…");

    for (
      let index = Math.max(2, current - 1);
      index <= Math.min(total - 1, current + 1);
      index += 1
    ) {
      pages.push(index);
    }

    if (current < total - 2) pages.push("…");

    pages.push(total);
  }

  const btn =
    "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-semibold transition";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${btn} text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <IcoChevronL className="h-4 w-4" />
      </button>

      {pages.map((page, index) =>
        page === "…" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-8 w-8 items-center justify-center text-sm text-slate-400"
          >
            …
          </span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => onChange(page)}
            className={`${btn} ${
              current === page
                ? "text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            style={current === page ? { background: ACCENT } : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${btn} text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <IcoChevronR className="h-4 w-4" />
      </button>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm font-semibold text-slate-800 ${
          mono ? "font-mono text-[12px]" : ""
        }`}
      >
        {show(value)}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <p className="mb-3 border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      {children}
    </section>
  );
}

function PondDetailModal({ pond, onClose }) {
  useEffect(() => {
    if (!pond) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pond]);

  if (!pond) return null;

  const area = getPondArea(pond);
  const pondQr = getPondQr(pond);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="
          relative z-10 flex h-full flex-col overflow-hidden bg-white shadow-2xl
          md:m-auto md:h-auto md:max-h-[90vh] md:w-full md:max-w-3xl md:rounded-2xl md:ring-1 md:ring-black/10
        "
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 px-5 py-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: ACCENT }}
          >
            <IcoPond className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-800">
              {getPondName(pond)}
            </p>

            <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
              {pondQr !== "—" ? pondQr : getPondCode(pond)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-200 active:scale-95"
          >
            <IcoX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          <Section title="Pond Details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Pond Name" value={getPondName(pond)} />
              <DetailRow label="Pond Code" value={getPondCode(pond)} mono />

              {pondQr !== "—" && (
                <DetailRow label="Pond QR" value={pondQr} mono />
              )}

              <DetailRow label="Pond Type" value={pond.pond_type} />
              <DetailRow
                label="Water Spread Area"
                value={area ? `${area} acres` : null}
              />
              <DetailRow label="Volume" value={pond.volume} />
            </div>
          </Section>

          <Section title="Farm / Owner Details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Farm Code" value={pond.farm_code} mono />
              <DetailRow label="Farm Name" value={pond.farm_name} />
              <DetailRow label="Owner ID" value={pond.owner_id} mono />
              <DetailRow label="Username" value={pond.username} />
            </div>
          </Section>

          <Section title="Status">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Verification" value={getVerificationText(pond)} />
              <DetailRow
                label="Active Status"
                value={isPondActive(pond) ? "Active" : "Inactive"}
              />
            </div>
          </Section>

          <Section title="Location">
            {pond.pond_gps ? (
              <a
                href={pond.pond_gps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
              >
                <IcoMapPin className="h-4 w-4 shrink-0" />
                View on Google Maps
              </a>
            ) : (
              <p className="text-sm text-slate-400">No GPS data available</p>
            )}
          </Section>

          {pond.image_url && (
            <Section title="Pond Image">
              <div className="flex max-h-72 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <img
                  src={pond.image_url}
                  alt="Pond"
                  className="w-full object-cover"
                />
              </div>
            </Section>
          )}

          <Section title="Timestamps">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow label="Created At" value={formatDate(pond.created_at)} />
              <DetailRow label="Updated At" value={formatDate(pond.updated_at)} />
            </div>
          </Section>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="ml-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 disabled:opacity-40"
              title="Refresh"
            >
              <IcoRefresh
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>

        <div className="relative">
          <IcoSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search pond, code, QR, farm..."
            className="
              h-9 w-full rounded-xl bg-slate-50 pl-9 pr-4 text-sm text-slate-800 ring-1 ring-slate-200
              placeholder:text-slate-400 focus:bg-white focus:outline-none sm:w-64
            "
            onFocus={(event) => {
              event.target.style.boxShadow = `0 0 0 2px ${ACCENT}55`;
            }}
            onBlur={(event) => {
              event.target.style.boxShadow = "";
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
    <div className="flex flex-col items-center justify-center gap-2 py-14">
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
    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing <strong className="text-slate-700">{from}–{to}</strong> of{" "}
        <strong className="text-slate-700">{filtered}</strong> pond(s)
      </p>

      <Pagination current={page} total={totalPages} onChange={onPageChange} />
    </div>
  );
}

function PondMobileCard({
  pond,
  verified,
  updatingMap,
  updateErrMap,
  onView,
  onVerifyChange,
  onActiveChange,
}) {
  const area = getPondArea(pond);
  const secondLabel = verified ? "Pond QR: " : "Pond Code: ";
  const secondValue = verified ? getPondQr(pond) : getPondCode(pond);

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">
            {getPondName(pond)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onView(pond)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: ACCENT }}
        >
          <IcoEye className="h-3.5 w-3.5" />
          View
        </button>
      </div>

      <div className="grid grid-cols-1 gap-1.5 text-xs">
        <div>
          <span className="text-slate-400">{secondLabel}</span>
          <span className="font-mono text-slate-700">{secondValue}</span>
        </div>

        <div>
          <span className="text-slate-400">Area: </span>
          <span className="text-slate-700">{area ? `${area} ac` : "—"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Verification:</span>

          <StatusDropdown
            value={verified ? "verified" : "unverified"}
            options={VERIFY_OPTIONS}
            onChange={(value) => onVerifyChange(pond, value)}
            isUpdating={!!updatingMap[pond.id]}
            disabled={verified}
          />
        </div>

        {verified && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Active:</span>

            <StatusDropdown
              value={isPondActive(pond) ? "active" : "inactive"}
              options={ACTIVE_OPTIONS}
              onChange={(value) => onActiveChange(pond, value)}
              isUpdating={!!updatingMap[pond.id]}
            />
          </div>
        )}
      </div>

      {updateErrMap[pond.id] && (
        <p className="text-xs text-rose-600">⚠ {updateErrMap[pond.id]}</p>
      )}
    </div>
  );
}

function PondDesktopRow({
  pond,
  verified,
  updatingMap,
  updateErrMap,
  onView,
  onVerifyChange,
  onActiveChange,
}) {
  const area = getPondArea(pond);
  const secondValue = verified ? getPondQr(pond) : getPondCode(pond);

  return (
    <React.Fragment>
      <tr className="transition hover:bg-slate-50/60">
        <td className="border-b border-slate-100 px-4 py-3.5 align-middle font-semibold text-slate-800">
          {getPondName(pond)}
        </td>

        <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
          <span className="rounded-lg bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            {secondValue}
          </span>
        </td>

        <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3.5 align-middle text-slate-700">
          {area ? `${area} ac` : "—"}
        </td>

        <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
          <div className="flex flex-wrap items-center gap-2">
            <StatusDropdown
              value={verified ? "verified" : "unverified"}
              options={VERIFY_OPTIONS}
              onChange={(value) => onVerifyChange(pond, value)}
              isUpdating={!!updatingMap[pond.id]}
              disabled={verified}
            />

            {verified && (
              <StatusDropdown
                value={isPondActive(pond) ? "active" : "inactive"}
                options={ACTIVE_OPTIONS}
                onChange={(value) => onActiveChange(pond, value)}
                isUpdating={!!updatingMap[pond.id]}
              />
            )}

            <button
              type="button"
              onClick={() => onView(pond)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
              style={{ background: ACCENT }}
            >
              <IcoEye className="h-3.5 w-3.5" />
              View
            </button>
          </div>
        </td>
      </tr>

      {updateErrMap[pond.id] && (
        <tr>
          <td
            colSpan={4}
            className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-600"
          >
            ⚠ {updateErrMap[pond.id]}
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export default function PondApproval() {
  const dispatch = useDispatch();

  const pendingPonds = useSelector(selectPendingPonds);
  const approvedPonds = useSelector(selectApprovedPonds);
  const loading = useSelector(selectPondsLoading);
  const error = useSelector(selectPondsError);
  const updatingMap = useSelector((state) => state.pondApproval.updating || {});
  const updateErrMap = useSelector(
    (state) => state.pondApproval.updateError || {}
  );

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

  const handleVerifyChange = (pond, newStatus) => {
    if (newStatus === "verified") {
      dispatch(approvePond({ id: pond.id, pond }));
      return;
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
  };

  const handleActiveChange = (pond, newActive) => {
    dispatch(
      updatePond({
        id: pond.id,
        pond,
        overrides: {
          pond_status: newActive === "active" ? "Active" : "Inactive",
        },
      })
    );
  };

  const filterPonds = (list, query) => {
    const q = query.trim().toLowerCase();

    if (!q) return list || [];

    return (list || []).filter((pond) =>
      [
        getPondName(pond),
        getPondCode(pond),
        getPondQr(pond),
        pond?.farm_code,
        pond?.farm_name,
        pond?.owner_id,
        pond?.username,
        pond?.pond_type,
        pond?.pond_status,
        pond?.verification_status,
        pond?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  };

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

  const COLS_U = ["POND NAME", "POND CODE", "AREA", "ACTIONS"];
  const COLS_V = ["POND NAME", "POND QR", "AREA", "ACTIONS"];

  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-slate-100 px-6 pb-5 pt-6">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <IcoPond className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          Aquaculture
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-800">
          Pond Registry
        </h1>

        <p className="mt-0.5 text-sm text-slate-500">
          Verify ponds and manage their active status
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          <span>⚠ {error}</span>

          <button
            type="button"
            onClick={() => dispatch(clearError())}
            className="shrink-0 rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold transition hover:bg-rose-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mx-6 my-5 space-y-6">
        <TableCard
          icon={<IcoPond className="h-5 w-5" />}
          title="Unverified Ponds"
          count={(pendingPonds || []).length}
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
          {loading && (pendingPonds || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-400">
              <span
                className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200"
                style={{ borderTopColor: ACCENT }}
              />

              <span className="text-sm">Loading ponds…</span>
            </div>
          ) : filteredU.length === 0 ? (
            <Empty
              message={
                uSearch
                  ? "Try a different search term."
                  : "All ponds are verified!"
              }
            />
          ) : (
            <>
              <div className="divide-y divide-slate-100 sm:hidden">
                {pageU.map((pond) => (
                  <PondMobileCard
                    key={pond.id}
                    pond={pond}
                    verified={false}
                    updatingMap={updatingMap}
                    updateErrMap={updateErrMap}
                    onView={setViewPond}
                    onVerifyChange={handleVerifyChange}
                    onActiveChange={handleActiveChange}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      {COLS_U.map((head) => (
                        <th
                          key={head}
                          className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-[10px] font-bold tracking-[0.18em] text-slate-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pageU.map((pond) => (
                      <PondDesktopRow
                        key={pond.id}
                        pond={pond}
                        verified={false}
                        updatingMap={updatingMap}
                        updateErrMap={updateErrMap}
                        onView={setViewPond}
                        onVerifyChange={handleVerifyChange}
                        onActiveChange={handleActiveChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </TableCard>

        <TableCard
          icon={<IcoCheck className="h-5 w-5" />}
          title="Verified Ponds"
          count={(approvedPonds || []).length}
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
              message={
                vSearch
                  ? "Try a different search term."
                  : "No verified ponds yet."
              }
            />
          ) : (
            <>
              <div className="divide-y divide-slate-100 sm:hidden">
                {pageV.map((pond) => (
                  <PondMobileCard
                    key={pond.id}
                    pond={pond}
                    verified={true}
                    updatingMap={updatingMap}
                    updateErrMap={updateErrMap}
                    onView={setViewPond}
                    onVerifyChange={handleVerifyChange}
                    onActiveChange={handleActiveChange}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      {COLS_V.map((head) => (
                        <th
                          key={head}
                          className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-[10px] font-bold tracking-[0.18em] text-slate-400"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pageV.map((pond) => (
                      <PondDesktopRow
                        key={pond.id}
                        pond={pond}
                        verified={true}
                        updatingMap={updatingMap}
                        updateErrMap={updateErrMap}
                        onView={setViewPond}
                        onVerifyChange={handleVerifyChange}
                        onActiveChange={handleActiveChange}
                      />
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