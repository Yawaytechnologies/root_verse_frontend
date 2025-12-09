import React from "react";
import { FiClock } from "react-icons/fi";

function ActivityDot({ type }) {
  let cls =
    "w-2 h-2 rounded-full border shadow-[0_0_12px_rgba(16,185,129,0.6)] ";
  if (type === "harvest") {
    cls += "bg-emerald-400 border-emerald-300";
  } else if (type === "water") {
    cls += "bg-sky-400 border-sky-300";
  } else {
    cls += "bg-amber-400 border-amber-300";
  }
  return <span className={cls} />;
}

export default function RecentActivity({ items = [] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            Recent activity
          </h2>
          <p className="text-xs text-slate-400">
            Latest logs synced from the field app.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <FiClock className="text-xs" />
          Last sync · 2 min ago
        </span>
      </div>

      <ol className="space-y-3 text-xs">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex gap-3 border border-slate-800 rounded-xl px-3 py-2.5 bg-slate-950/80"
          >
            <div className="mt-[3px]">
              <ActivityDot type={item.type} />
            </div>
            <div className="flex-1">
              <p className="text-slate-50 font-medium">{item.title}</p>
              <p className="text-[11px] text-slate-400">{item.unit}</p>
              <p className="text-[11px] text-slate-500 mt-1">{item.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
