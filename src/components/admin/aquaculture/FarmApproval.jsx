// src/modules/admin/aquaculture/pages/FarmPondApproval.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAllFarms } from "../../../redux/action/farmActions";
import {
  selectAllFarms,
  selectFarmsLoading,
  selectFarmsError,
  clearError,
} from "../../../redux/reducer/farmapprovalSlice";

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

const IcoFarm = (props) => (
  <Ico
    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"
    {...props}
  />
);

const IcoMap = (props) => (
  <Ico
    d="M12 21S5 13.5 5 9a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
    {...props}
  />
);

const IcoX = (props) => <Ico d="M18 6 6 18M6 6l12 12" {...props} />;
const IcoChevronL = (props) => <Ico d="m15 18-6-6 6-6" {...props} />;
const IcoChevronR = (props) => <Ico d="m9 18 6-6-6-6" {...props} />;

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

function empty(value) {
  return value === null || value === undefined || value === "";
}

function show(value) {
  if (empty(value)) return "—";
  return String(value);
}

function getFarmQr(farm) {
  return farm?.farm_qrs || "—";
}

function getFarmCode(farm) {
  return farm?.farm_code || "—";
}

function formatDate(value) {
  if (empty(value)) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

function FarmDetailModal({ farm, onClose }) {
  useEffect(() => {
    if (!farm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [farm]);

  if (!farm) return null;

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
            <IcoFarm className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-800">
              {farm.name || "Farm Details"}
            </p>

            <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
              {getFarmQr(farm)}
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
          <Section title="Farm Details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Farm QR" value={farm.farm_qrs} mono />
              <DetailRow label="Farm Code" value={farm.farm_code} mono />
              <DetailRow label="Farm Name" value={farm.name} />
              <DetailRow label="Address" value={farm.farm_address} />
              <DetailRow
                label="Farm Area"
                value={farm.total_area ? `${farm.total_area} acres` : null}
              />
              <DetailRow label="Water Source" value={farm.water_source} />
            </div>
          </Section>

          <Section title="Owner">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Owner ID" value={farm.owner_id} mono />
              <DetailRow label="Username" value={farm.username} />
            </div>
          </Section>

          <Section title="Technician">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Technician Name" value={farm.technician_name} />
              <DetailRow
                label="Technician Phone"
                value={farm.technician_phone}
                mono
              />
            </div>
          </Section>

          <Section title="Coordinates">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <div className="flex items-start gap-3">
                <IcoMap className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

                <div className="min-w-0 flex-1">
                  <p className="break-all font-mono text-sm font-semibold text-slate-800">
                    {show(farm.latitude)}, {show(farm.longitude)}
                  </p>

                  {farm.latitude && farm.longitude && (
                    <a
                      href={`https://maps.google.com/?q=${farm.latitude},${farm.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: ACCENT }}
                    >
                      Open in Maps ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Timestamps">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow label="Created At" value={formatDate(farm.created_at)} />
              <DetailRow label="Updated At" value={formatDate(farm.updated_at)} />
            </div>
          </Section>

          {farm.image_url && (
            <Section title="Farm Image">
              <div className="max-h-72 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <img
                  src={farm.image_url}
                  alt="Farm"
                  className="h-full w-full object-cover"
                />
              </div>
            </Section>
          )}
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

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (current > 3) {
      pages.push("…");
    }

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i += 1
    ) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("…");
    }

    pages.push(total);
  }

  const btnBase =
    "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-semibold transition";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30`}
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
            className={`${btnBase} ${
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
        className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <IcoChevronR className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function FarmList() {
  const dispatch = useDispatch();

  const allFarms = useSelector(selectAllFarms);
  const loading = useSelector(selectFarmsLoading);
  const error = useSelector(selectFarmsError);

  const [viewFarm, setViewFarm] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllFarms());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return allFarms;

    return allFarms.filter((farm) =>
      [
        farm.farm_code,
        farm.farm_qrs,
        farm.name,
        farm.farm_address,
        farm.total_area,
        farm.water_source,
        farm.owner_id,
        farm.username,
        farm.technician_name,
        farm.technician_phone,
        farm.latitude,
        farm.longitude,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [allFarms, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, filtered.length);

  return (
    <div className="min-h-full bg-white">
      <div className="border-b border-slate-100 px-4 pb-5 pt-6 sm:px-6">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <IcoFarm className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          Aquaculture
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-800">
          Farm Registry
        </h1>

        <p className="mt-0.5 text-sm text-slate-500">
          View registered farms and open full details in popup
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200 sm:mx-6">
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

      <div className="mx-4 my-5 overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:mx-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: ACCENT }}
            >
              <IcoFarm className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-slate-800">Farms</p>
              <p className="text-xs text-slate-500">
                {loading
                  ? "Loading…"
                  : `${filtered.length} farm${
                      filtered.length !== 1 ? "s" : ""
                    }`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dispatch(fetchAllFarms())}
              disabled={loading}
              className="ml-1 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
              title="Refresh"
            >
              <IcoRefresh
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <IcoSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search farm, QR, owner, tech..."
              className="
                h-10 w-full rounded-xl bg-slate-50 pl-9 pr-4 text-sm text-slate-800 ring-1 ring-slate-200
                placeholder:text-slate-400 focus:bg-white focus:outline-none
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

        {loading && allFarms.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <span
              className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200"
              style={{ borderTopColor: ACCENT }}
            />

            <span className="text-sm">Loading farms...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <IcoFarm className="h-6 w-6 text-slate-400" />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              No farms found
            </p>

            <p className="text-xs text-slate-400">
              {search
                ? "Try a different search term."
                : "No farms registered yet."}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <div className="divide-y divide-slate-100 lg:hidden">
              {paginated.map((farm) => (
                <div key={farm.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">
                        {farm.name || "—"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewFarm(farm)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: ACCENT }}
                    >
                      <IcoEye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </div>

                  <div className="mt-3 space-y-1 text-xs">
                    <p className="truncate">
                      <span className="text-slate-400">Farm QR: </span>
                      <span className="font-mono text-slate-700">
                        {getFarmQr(farm)}
                      </span>
                    </p>

                    <p className="truncate">
                      <span className="text-slate-400">Address: </span>
                      <span className="text-slate-700">
                        {farm.farm_address || "—"}
                      </span>
                    </p>

                    <p>
                      <span className="text-slate-400">Area: </span>
                      <span className="text-slate-700">
                        {farm.total_area ? `${farm.total_area} ac` : "—"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-hidden lg:block">
              <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                <colgroup>
                  <col className="w-[24%]" />
                  <col className="w-[22%]" />
                  <col className="w-[30%]" />
                  <col className="w-[10%]" />
                  <col className="w-[14%]" />
                </colgroup>

                <thead>
                  <tr>
                    {["FARM", "FARM QR", "ADDRESS", "AREA", "ACTIONS"].map(
                      (head) => (
                        <th
                          key={head}
                          className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400"
                        >
                          {head}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((farm) => (
                    <tr
                      key={farm.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                        <p className="truncate font-semibold text-slate-800">
                          {farm.name || "—"}
                        </p>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                        <p className="truncate font-mono text-[11px] font-semibold text-slate-600">
                          {getFarmQr(farm)}
                        </p>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                        <p className="truncate text-slate-600">
                          {farm.farm_address || "—"}
                        </p>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                        <span className="whitespace-nowrap text-slate-700">
                          {farm.total_area ? `${farm.total_area} ac` : "—"}
                        </span>
                      </td>

                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                        <button
                          type="button"
                          onClick={() => setViewFarm(farm)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                          style={{ background: ACCENT }}
                        >
                          <IcoEye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <strong className="text-slate-700">
                  {showingFrom}–{showingTo}
                </strong>{" "}
                of <strong className="text-slate-700">{filtered.length}</strong>{" "}
                farm(s)
              </p>

              <Pagination
                current={safePage}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <FarmDetailModal farm={viewFarm} onClose={() => setViewFarm(null)} />
    </div>
  );
}