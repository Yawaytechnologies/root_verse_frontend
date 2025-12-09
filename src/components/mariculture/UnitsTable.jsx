import React from "react";

function StatusPill({ status }) {
  let cls =
    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ";
  if (status === "Healthy") {
    cls += "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
  } else if (status === "Harvest due") {
    cls += "bg-amber-500/10 border-amber-500/40 text-amber-300";
  } else {
    cls += "bg-rose-500/10 border-rose-500/40 text-rose-300";
  }
  return <span className={cls}>{status}</span>;
}

export default function UnitsTable({ units = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            Cultivation units
          </h2>
          <p className="text-xs text-slate-400">
            Rafts, long-lines, and cages currently tracked.
          </p>
        </div>
        <span className="text-[11px] text-slate-400">
          {units.length} units
        </span>
      </div>

      {/* Cards instead of table */}
      <div className="p-4 sm:p-5">
        {units.length === 0 ? (
          <p className="text-xs text-slate-500">No units found.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 sm:px-4 sm:py-3.5 flex flex-col gap-2 hover:border-emerald-500/50 hover:bg-slate-900 transition"
              >
                {/* Top row: Name + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-50 truncate">
                      {unit.name}
                    </p>
                    <p className="text-[11px] text-slate-500 break-all">
                      {unit.id}
                    </p>
                  </div>
                  <StatusPill status={unit.status} />
                </div>

                {/* Middle: farm + species */}
                <div className="text-[11px] text-slate-400 space-y-1 mt-1">
                  <p>
                    <span className="text-slate-500">Producer group: </span>
                    <span className="text-slate-200">{unit.farmName}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Species: </span>
                    <span className="text-slate-200">{unit.species}</span>
                  </p>
                </div>

                {/* Bottom: growth + last check */}
                <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-slate-400">
                  <p>
                    <span className="text-slate-500">Growth: </span>
                    <span className="text-slate-200">{unit.growth}</span>
                  </p>
                  <p className="text-right">
                    <span className="text-slate-500">Last check: </span>
                    <span className="text-slate-200 whitespace-nowrap">
                      {unit.lastCheck}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
