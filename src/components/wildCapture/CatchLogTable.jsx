// src/components/wildCapture/CatchLogTable.jsx
import React, { useMemo, useState } from "react";

const PAGE_SIZE = 5;

export default function CatchLogTable({ catchLogs = [], onAddClick }) {
  const [search, setSearch] = useState("");
  const [faoFilter, setFaoFilter] = useState("all");
  const [gearFilter, setGearFilter] = useState("all");
  const [page, setPage] = useState(1);

  /* -------------------- Search + Filter -------------------- */
  const filteredLogs = useMemo(() => {
    return catchLogs.filter((log) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        term === "" ||
        log.tripId.toLowerCase().includes(term) ||
        log.species.toLowerCase().includes(term) ||
        (log.gear || "").toLowerCase().includes(term);

      const matchesFao =
        faoFilter === "all" || String(log.faoZone) === faoFilter;

      const matchesGear =
        gearFilter === "all" ||
        (log.gear && log.gear.toLowerCase() === gearFilter.toLowerCase());

      return matchesSearch && matchesFao && matchesGear;
    });
  }, [catchLogs, search, faoFilter, gearFilter]);

  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageLogs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, safePage]);

  const goToPage = (p) => {
    const n = Math.min(Math.max(1, p), totalPages);
    setPage(n);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFaoChange = (val) => {
    setFaoFilter(val);
    setPage(1);
  };

  const handleGearChange = (val) => {
    setGearFilter(val);
    setPage(1);
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="bg-transparent">
      {/* CARD (no overflow-hidden so dropdowns are visible) */}
      <div className="rounded-3xl bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)] border border-slate-100">
        {/* Top gradient header */}
        <div className="rounded-t-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 px-5 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-white/15 flex items-center justify-center text-white text-sm font-semibold">
              CL
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Catch Logs</p>
              <p className="text-[11px] text-white/70">
                Per-haul catch events with FAO zones and crates.
              </p>
            </div>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] text-white">
              {total} total
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            {/* Search */}
            <div className="flex items-center bg-white/30 rounded-full pl-3 pr-2 py-1">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search trip, species..."
                className="bg-transparent text-[11px] text-white placeholder:text-white/60 outline-none w-32 sm:w-48"
              />
              <span className="text-white/70 text-xs ml-1">🔍</span>
            </div>

            {/* FAO filter */}
            <select
              value={faoFilter}
              onChange={(e) => handleFaoChange(e.target.value)}
              className="text-[11px] rounded-full bg-white/10 text-black border border-white/30 px-3 py-1 outline-none"
            >
              <option value="all">All FAO Zones</option>
              <option value="57">Zone 57</option>
              <option value="58">Zone 58</option>
              <option value="71">Zone 71</option>
            </select>

            {/* Gear filter */}
            <select
              value={gearFilter}
              onChange={(e) => handleGearChange(e.target.value)}
              className="text-[11px] rounded-full bg-white/10 text-black border border-white/30 px-3 py-1 outline-none"
            >
              <option value="all">All Gear Types</option>
              <option value="Longline">Longline</option>
              <option value="Gillnet">Gillnet</option>
              <option value="Handline">Handline</option>
              <option value="Purse Seine">Purse Seine</option>
            </select>

            {/* Add button */}
       <button
  type="button"
  onClick={onAddClick}
  className="
    relative inline-flex items-center justify-center
    px-5 py-2 rounded-full border-2 border-white
    text-[11px] font-semibold tracking-wide uppercase text-white
    overflow-hidden group

    before:content-[''] before:absolute before:top-[6px] before:left-[-2px]
    before:w-[calc(100%+4px)] before:h-[calc(100%-12px)]
    before:bg-slate-900 before:transition-transform before:duration-300
    before:origin-center before:scale-y-100 group-hover:before:scale-y-0

    after:content-[''] after:absolute after:left-[6px] after:top-[-2px]
    after:h-[calc(100%+4px)] after:w-[calc(100%-12px)]
    after:bg-slate-900 after:transition-transform after:duration-300
    after:origin-center after:scale-x-100 after:delay-150
    group-hover:after:scale-x-0
  "
>
  <span className="relative z-10 normal-case">
    + Add Catch Log
  </span>
</button>


          </div>
        </div>

        {/* Column headers – note: Weight + FAO now separate */}
        <div className="px-5 py-2 border-b border-slate-100 bg-slate-50/40">
          <div className="grid grid-cols-12 text-[11px] font-medium text-slate-500">
            <div className="col-span-3">Trip / Haul</div>
            <div className="col-span-2">Species</div>
            <div className="col-span-2 text-left">Weight</div>
            <div className="col-span-1">FAO</div>
            <div className="col-span-1">Gear</div>
            <div className="col-span-2 hidden md:block">Haul Time</div>
            <div className="col-span-1 text-right">Crates</div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {pageLogs.map((log) => (
            <div
              key={log.id}
              className="px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="grid grid-cols-12 items-center text-xs text-slate-700 gap-y-1">
                {/* Trip / Haul */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">
                      {log.tripId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Haul #{log.haulNo}
                    </span>
                  </div>
                </div>

                {/* Species */}
                <div className="col-span-2">
                  <span className="text-slate-800">{log.species}</span>
                </div>

                {/* Weight only */}
                <div className="col-span-2 text-left">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span>{log.estWeightKg.toLocaleString()} kg</span>
                    <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (log.estWeightKg / 600) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* FAO only */}
                <div className="col-span-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-[11px] text-indigo-600">
                    Zone {log.faoZone}
                  </span>
                </div>

                {/* Gear */}
                <div className="col-span-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-700">
                    {log.gear}
                  </span>
                </div>

                {/* Haul time */}
                <div className="col-span-2 hidden md:flex flex-col text-[11px] text-slate-500">
                  <span>{log.haulTime}</span>
                </div>

                {/* Crates */}
                <div className="col-span-1 text-right">
                  <button className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-50 text-[11px] text-violet-600">
                    {log.cratesLinked} crates
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pageLogs.length === 0 && (
            <div className="px-5 py-6 text-center text-xs text-slate-400">
              No catch logs match your filters.
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="px-5 py-3 border-t border-slate-100 rounded-b-3xl flex items-center justify-between text-[11px] text-slate-500">
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
              const isActive = p === safePage;

              if (p === 1 || p === totalPages || Math.abs(p - safePage) <= 1) {
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-2 py-1 rounded-full ${
                      isActive
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
            Showing {pageLogs.length} of {total} results
          </p>
        </div>
      </div>
    </div>
  );
}
