import React from "react";
import { FiSearch } from "react-icons/fi";

export default function FiltersBar() {
  return (
    <section className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
      <div className="flex flex-wrap gap-3">
        <select className="bg-slate-900 border border-slate-700 text-xs sm:text-sm rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500">
          <option>All Producer Groups</option>
          <option>Ramanathapuram SHG Cluster</option>
          <option>Palk Bay Producers Group</option>
        </select>

        <select className="bg-slate-900 border border-slate-700 text-xs sm:text-sm rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500">
          <option>All Unit Types</option>
          <option>Rafts</option>
          <option>Long-lines</option>
          <option>Cages</option>
        </select>

        <select className="bg-slate-900 border border-slate-700 text-xs sm:text-sm rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500">
          <option>Status: All</option>
          <option>Healthy</option>
          <option>Harvest due</option>
          <option>Attention</option>
        </select>
      </div>

      <div className="w-full lg:w-72">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search by ID, raft, SHG, or village…"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
    </section>
  );
}
