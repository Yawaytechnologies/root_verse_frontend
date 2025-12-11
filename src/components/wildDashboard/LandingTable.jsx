// src/components/dashboard/LandingTable.jsx
import React from "react";
import { landingRecords } from "../../data/wildCaptureMock";

export default function LandingTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Recent Landing Records
          </p>
          <p className="text-[11px] text-slate-500">
            Latest verified trips at harbors
          </p>
        </div>
        <button className="text-[11px] text-indigo-600 font-medium">
          See all
        </button>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="min-w-full text-xs text-left">
          <thead>
            <tr className="text-[11px] text-slate-400 border-b border-slate-100">
              <th className="px-3 py-2 font-medium">Captain / Vessel</th>
              <th className="px-3 py-2 font-medium">Species</th>
              <th className="px-3 py-2 font-medium">Weight</th>
              <th className="px-3 py-2 font-medium">Landing Center</th>
              <th className="px-3 py-2 font-medium">Method</th>
              <th className="px-3 py-2 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {landingRecords.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">
                      {row.captain}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {row.vesselId}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">{row.species}</td>
                <td className="px-3 py-2">{row.weight}</td>
                <td className="px-3 py-2">{row.landingCenter}</td>
                <td className="px-3 py-2">{row.method}</td>
                <td className="px-3 py-2 text-right text-slate-500">
                  {row.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
