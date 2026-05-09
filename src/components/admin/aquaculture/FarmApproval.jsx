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

const ACCENT    = "#25B7FF";
const PAGE_SIZE = 10;

/* ── Icons ── */
const Ico = ({ d, ...p }) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <path d={d} />
  </svg>
);
const IcoRefresh  = (p) => <Ico d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 16l2.26 2.26A9.75 9.75 0 0 0 12 21a9 9 0 0 0 9-9" {...p} />;
const IcoSearch   = (p) => <Ico d="M21 21l-4.3-4.3M11 18A7 7 0 1 0 4 11a7 7 0 0 0 7 7Z" {...p} />;
const IcoFarm     = (p) => <Ico d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" {...p} />;
const IcoMap      = (p) => <Ico d="M12 21S5 13.5 5 9a7 7 0 0 1 14 0c0 4.5-7 12-7 12Z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" {...p} />;
const IcoX        = (p) => <Ico d="M18 6 6 18M6 6l12 12" {...p} />;
const IcoChevronL = (p) => <Ico d="m15 18-6-6 6-6" {...p} />;
const IcoChevronR = (p) => <Ico d="m9 18 6-6-6-6" {...p} />;
const IcoEye      = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ── Detail Modal ── */
function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800 break-words">{value || "—"}</p>
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
               style={{ background: ACCENT }}>
            <IcoFarm className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-800">{farm.name}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{farm.farm_code}</p>
          </div>
          <button onClick={onClose}
            className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 transition active:scale-95">
            <IcoX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Farm Identity</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Farm ID"   value={farm.farm_code} />
              <DetailRow label="Farm Name" value={farm.name} />
              <DetailRow label="Owner ID"  value={farm.owner_id} />
              <DetailRow label="Address"   value={farm.farm_address} />
            </div>
          </section>
          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Farm Details</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailRow label="Area"         value={farm.total_area ? `${farm.total_area} acres` : null} />
              <DetailRow label="Water Source" value={farm.water_source} />
              <DetailRow label="Pond Count"   value={farm.pond_count} />
            </div>
          </section>
          <section>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase border-b border-slate-100 pb-2">Coordinates</p>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <IcoMap className="h-5 w-5 shrink-0 text-slate-400" />
              <span className="flex-1 font-mono text-sm text-slate-800 break-all">
                {farm.latitude || "—"}, {farm.longitude || "—"}
              </span>
              {farm.latitude && farm.longitude && (
                <a href={`https://maps.google.com/?q=${farm.latitude},${farm.longitude}`}
                   target="_blank" rel="noreferrer"
                   className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                   style={{ background: ACCENT }}>
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
          <button onClick={onClose}
            className="w-full rounded-xl bg-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition active:scale-[0.98]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  // Show at most 5 page numbers with ellipsis
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  const btnBase = "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-semibold transition";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <IcoChevronL className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`${btnBase} ${current === p
              ? "text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"}`}
            style={current === p ? { background: ACCENT } : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${btnBase} text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <IcoChevronR className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function FarmList() {
  const dispatch = useDispatch();

  const allFarms = useSelector(selectAllFarms);
  const loading  = useSelector(selectFarmsLoading);
  const error    = useSelector(selectFarmsError);

  const [viewFarm, setViewFarm] = useState(null);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);

  useEffect(() => { dispatch(fetchAllFarms()); }, [dispatch]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allFarms;
    return allFarms.filter((f) =>
      [f.name, f.farm_code, f.farm_address, f.water_source, String(f.owner_id ?? "")]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [allFarms, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="min-h-full bg-white">

      {/* Page header */}
      <div className="border-b border-slate-100 px-6 pt-6 pb-5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-2">
          <IcoFarm className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          Aquaculture
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Farm Registry</h1>
        <p className="mt-0.5 text-sm text-slate-500">View, search and manage registered farms</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
          <span>⚠ {error}</span>
          <button onClick={() => dispatch(clearError())}
            className="shrink-0 rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold hover:bg-rose-200 transition">
            Dismiss
          </button>
        </div>
      )}

      {/* Card */}
      <div className="mx-6 my-5 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

        {/* Card header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                 style={{ background: ACCENT }}>
              <IcoFarm className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Farms</p>
              <p className="text-xs text-slate-500">
                {loading ? "Loading…" : `${filtered.length} farm${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={() => dispatch(fetchAllFarms())}
              disabled={loading}
              className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-40"
              title="Refresh"
            >
              <IcoRefresh className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <IcoSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, address…"
              className="h-9 w-full sm:w-64 rounded-xl bg-slate-50 pl-9 pr-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400
                         focus:bg-white focus:outline-none transition"
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${ACCENT}55`}
              onBlur={(e)  => e.target.style.boxShadow = ""}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && allFarms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <span className="h-7 w-7 rounded-full border-[3px] border-slate-200 animate-spin"
                  style={{ borderTopColor: ACCENT }} />
            <span className="text-sm">Loading farms…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <IcoFarm className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No farms found</p>
            <p className="text-xs text-slate-400">
              {search ? "Try a different search term." : "No farms registered yet."}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            {/* Mobile */}
            <div className="sm:hidden divide-y divide-slate-100">
              {paginated.map((farm) => (
                <div key={farm.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{farm.name || "—"}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">{farm.farm_code}</p>
                    </div>
                    <button onClick={() => setViewFarm(farm)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: ACCENT }}>
                      <IcoEye className="h-3.5 w-3.5" /> View
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                    <div><span className="text-slate-400">Address: </span><span className="text-slate-700">{farm.farm_address || "—"}</span></div>
                    <div><span className="text-slate-400">Area: </span><span className="text-slate-700">{farm.total_area ? `${farm.total_area} ac` : "—"}</span></div>
                    <div><span className="text-slate-400">Water: </span><span className="text-slate-700">{farm.water_source || "—"}</span></div>
                    <div><span className="text-slate-400">Owner ID: </span><span className="text-slate-700">{farm.owner_id ?? "—"}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead>
                  <tr>
                    {["FARM ID", "FARM NAME", "ADDRESS", "AREA", "WATER SOURCE", "OWNER ID", "ACTIONS"].map((h) => (
                      <th key={h}
                        className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-left text-[10px] font-bold tracking-[0.18em] text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((farm) => (
                    <tr key={farm.id} className="hover:bg-slate-50/60 transition">
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg ring-1 ring-slate-200/80 whitespace-nowrap">
                          {farm.farm_code || `#${farm.id}`}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle font-semibold text-slate-800">
                        {farm.name || "—"}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle text-slate-600 max-w-[200px] truncate">
                        {farm.farm_address || "—"}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle whitespace-nowrap text-slate-700">
                        {farm.total_area ? `${farm.total_area} ac` : "—"}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle text-slate-700">
                        {farm.water_source || "—"}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle text-slate-600">
                        {farm.owner_id ?? "—"}
                      </td>
                      <td className="border-b border-slate-100 px-4 py-3.5 align-middle">
                        <button
                          onClick={() => setViewFarm(farm)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                          style={{ background: ACCENT }}
                        >
                          <IcoEye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer: count + pagination */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <strong className="text-slate-700">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</strong>
                {" "}of <strong className="text-slate-700">{filtered.length}</strong> farm(s)
              </p>
              <Pagination current={safePage} total={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <FarmDetailModal farm={viewFarm} onClose={() => setViewFarm(null)} />
    </div>
  );
}