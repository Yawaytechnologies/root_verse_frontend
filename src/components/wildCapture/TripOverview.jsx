// src/components/wildCapture/TripOverview.jsx
import React, { useMemo, useState } from "react";

function StatusPill({ status }) {
  let cls =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ";
  if (status === "Landed") {
    cls += "bg-emerald-50 text-emerald-600";
  } else if (status === "At sea") {
    cls += "bg-indigo-50 text-indigo-600";
  } else {
    cls += "bg-amber-50 text-amber-600";
  }
  return <span className={cls}>{status}</span>;
}

const PAGE_SIZE = 5;

export default function TripOverview({
  trips = [],
  onAddClick,
  onMarkLanded, // 👈 NEW: callback for updating vessel landed
}) {
  const [search, setSearch] = useState("");
  const [faoFilter, setFaoFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  /* ------------ Filter + Search + Pagination ------------ */

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        term === "" ||
        t.id.toLowerCase().includes(term) ||
        (t.vesselName || "").toLowerCase().includes(term) ||
        (t.vesselId || "").toLowerCase().includes(term) ||
        (t.captain || "").toLowerCase().includes(term) ||
        (t.targetSpecies || "").toLowerCase().includes(term);

      const matchesFao =
        faoFilter === "all" || String(t.faoZone) === faoFilter;

      const matchesStatus =
        statusFilter === "all" ||
        ((t.status || "").toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesFao && matchesStatus;
    });
  }, [trips, search, faoFilter, statusFilter]);

  const totalTrips = filteredTrips.length;
  const atSea = filteredTrips.filter((t) => t.status === "At sea").length;
  const landed = filteredTrips.filter((t) => t.status === "Landed").length;
  const totalKg = filteredTrips
    .filter((t) => t.totalCatchKg)
    .reduce((sum, t) => sum + t.totalCatchKg, 0)
    .toLocaleString();

  const totalPages = Math.max(1, Math.ceil(totalTrips / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageTrips = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTrips.slice(start, start + PAGE_SIZE);
  }, [filteredTrips, safePage]);

  const goToPage = (p) => {
    const n = Math.min(Math.max(1, p), totalPages);
    setPage(n);
  };

  /* ------------------------- UI ------------------------- */

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      {/* Header + mini stats */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Trip Registry
            </p>
            <p className="text-[11px] text-slate-500">
              RV-VES trips with status, method and FAO zones
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <div className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-700">
              Total trips: <span className="font-semibold">{totalTrips}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Landed: <span className="font-semibold">{landed}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              At sea: <span className="font-semibold">{atSea}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
              Landed catch:{" "}
              <span className="font-semibold">{totalKg} kg</span>
            </div>
          </div>
        </div>

        {/* Controls row: search + filters + Add Trip */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 rounded-full pl-3 pr-2 py-1 border border-slate-200">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search trip, vessel, captain..."
                className="bg-transparent text-[11px] text-slate-700 placeholder:text-slate-400 outline-none w-40 sm:w-60"
              />
              <span className="text-slate-400 text-xs ml-1">🔍</span>
            </div>
          </div>

          {/* Right: filters + button */}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <select
              value={faoFilter}
              onChange={(e) => {
                setFaoFilter(e.target.value);
                setPage(1);
              }}
              className="text-[11px] rounded-full bg-white text-slate-700 border border-slate-200 px-3 py-1 outline-none"
            >
              <option value="all">All FAO Zones</option>
              <option value="57">Zone 57</option>
              <option value="58">Zone 58</option>
              <option value="71">Zone 71</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-[11px] rounded-full bg-white text-slate-700 border border-slate-200 px-3 py-1 outline-none"
            >
              <option value="all">All Status</option>
              <option value="Landed">Landed</option>
              <option value="At sea">At sea</option>
            </select>

            <button
              type="button"
              onClick={onAddClick}
              className="
                inline-flex items-center justify-center
                px-4 py-1.5 rounded-full
                bg-slate-900 text-white text-[11px] font-medium shadow-sm
                hover:bg-slate-800 transition
              "
            >
              + Add Trip
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="min-w-full text-xs text-left">
          <thead>
            <tr className="text-[11px] text-slate-400 border-b border-slate-100">
              <th className="px-3 py-2 font-medium">Trip / Vessel</th>
              <th className="px-3 py-2 font-medium">Captain</th>
              <th className="px-3 py-2 font-medium">Target Species</th>
              <th className="px-3 py-2 font-medium">Method</th>
              <th className="px-3 py-2 font-medium">FAO Zone</th>
              <th className="px-3 py-2 font-medium">Catch (kg)</th>
              <th className="px-3 py-2 font-medium hidden md:table-cell">
                Departure
              </th>
              <th className="px-3 py-2 font-medium hidden md:table-cell">
                Landing
              </th>
              <th className="px-3 py-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageTrips.map((trip) => (
              <tr
                key={trip.id}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">
                      {trip.id}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {trip.vesselName} · {trip.vesselId}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">{trip.captain}</td>
                <td className="px-3 py-2">{trip.targetSpecies}</td>
                <td className="px-3 py-2">{trip.method}</td>
                <td className="px-3 py-2">{trip.faoZone}</td>
                <td className="px-3 py-2">
                  {trip.totalCatchKg
                    ? trip.totalCatchKg.toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-2 hidden md:table-cell text-slate-500">
                  {trip.departureAt}
                </td>
                <td className="px-3 py-2 hidden md:table-cell text-slate-500">
                  {trip.landingAt || "Pending"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <StatusPill status={trip.status} />

                    {trip.status === "At sea" && !!onMarkLanded && (
                      <button
                        type="button"
                        onClick={() => onMarkLanded(trip)}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition"
                      >
                        Mark Landed
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {pageTrips.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-6 text-center text-[11px] text-slate-400"
                >
                  No trips match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <button
            className="px-2 py-1 rounded-full hover:bg-slate-100 disabled:opacity-40"
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            const active = p === safePage;
            if (
              p === 1 ||
              p === totalPages ||
              Math.abs(p - safePage) <= 1
            ) {
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-2 py-1 rounded-full ${
                    active
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              );
            }
            if (p === 2 && safePage > 3) {
              return (
                <span key={p} className="px-1">
                  …
                </span>
              );
            }
            if (p === totalPages - 1 && safePage < totalPages - 2) {
              return (
                <span key={p} className="px-1">
                  …
                </span>
              );
            }
            return null;
          })}

          <button
            className="px-2 py-1 rounded-full hover:bg-slate-100 disabled:opacity-40"
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>

        <p>
          Showing {pageTrips.length} of {totalTrips} results
        </p>
      </div>
    </div>
  );
}
