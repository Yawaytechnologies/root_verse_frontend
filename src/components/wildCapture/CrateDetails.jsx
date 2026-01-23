// src/components/wildCapture/CrateDetails.jsx
import React from "react";


const labelClass = "text-[11px] font-medium text-slate-500";
const valueClass = "text-sm text-slate-900";

function statusBadge(status) {
  let base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ";
  if (status === "Available") {
    return base + "bg-emerald-50 text-emerald-700 border border-emerald-100";
  }
  if (status === "In use") {
    return base + "bg-indigo-50 text-indigo-700 border border-indigo-100";
  }
  if (status === "Cleaning") {
    return base + "bg-amber-50 text-amber-700 border border-amber-100";
  }
  return base + "bg-slate-50 text-slate-600 border border-slate-200";
}

export default function CrateDetails({ crate }) {
  if (!crate) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Crate Details
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {crate.label || crate.crateId}
          </p>
          <p className="text-[11px] text-slate-500">
            Crate ID:{" "}
            <span className="font-mono font-semibold">
              {crate.crateId}
            </span>
          </p>
          {crate.qrCode && (
            <p className="text-[11px] text-slate-500">
              QR Code:{" "}
              <span className="font-mono text-slate-900">
                {crate.qrCode}
              </span>
            </p>
          )}
        </div>
        <div className="text-right text-xs space-y-1">
          <span className={statusBadge(crate.status)}>
            {crate.status}
          </span>
          <p className="text-[11px] text-slate-500">
            Size:{" "}
            <span className="font-semibold text-slate-900">
              {crate.sizeCode} – {crate.sizeLabel}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            Capacity:{" "}
            <span className="font-semibold text-slate-900">
              {crate.capacityKg} kg
            </span>
          </p>
        </div>
      </div>

      {/* Assignment / trip info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <p className={labelClass}>Current Trip</p>
          <p className={valueClass}>
            {crate.currentTripId || "Not assigned (Available at landing site)"}
          </p>
        </div>
        <div>
          <p className={labelClass}>Last Used Trip</p>
          <p className={valueClass}>
            {crate.lastUsedTripId || "—"}
          </p>
        </div>
        <div>
          <p className={labelClass}>Last Used Species</p>
          <p className={valueClass}>
            {crate.lastUsedSpecies || "—"}
          </p>
        </div>
        <div>
          <p className={labelClass}>Last Used Port</p>
          <p className={valueClass}>
            {crate.lastUsedPort || "—"}
          </p>
        </div>
        <div>
          <p className={labelClass}>Last Scan / Update</p>
          <p className={valueClass}>
            {crate.lastUsedAt || "—"}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="text-xs">
        <p className={labelClass}>Notes</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Crate registry is maintained by admin. Assignment to trips happens
          during landing (link crate QR to trip + catch lot).
        </p>
      </div>
    </div>
  );
}
