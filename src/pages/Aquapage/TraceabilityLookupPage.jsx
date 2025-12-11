// src/pages/Aquapage/TraceabilityLookupPage.jsx
import React, { useState } from "react";
import {
  FiSearch,
  FiPackage,
  FiLayers,
  FiMapPin,
  FiDroplet,
  FiAlertTriangle,
} from "react-icons/fi";

/**
 * Dummy data joined from:
 * - Crates (crateCode → harvestId)
 * - Harvest batches (harvestId → pond, farm)
 * - Ponds (pondId → species)
 *
 * In real backend this will be 3 tables with proper relations.
 */

const PONDS = {
  "RV-POND-01": {
    id: "RV-POND-01",
    name: "Pond A",
    species: "Vannamei",
    farmId: "RV-FARM-TH-001045",
  },
  "RV-POND-02": {
    id: "RV-POND-02",
    name: "Pond B",
    species: "Black Tiger",
    farmId: "RV-FARM-TH-001045",
  },
  "RV-POND-04": {
    id: "RV-POND-04",
    name: "Pond D",
    species: "Vannamei",
    farmId: "RV-FARM-TH-001045",
  },
};

const HARVEST_BATCHES = {
  "AH-2025-12-001": {
    id: "AH-2025-12-001",
    harvestDate: "2025-12-09",
    pondId: "RV-POND-04",
    pondName: "Pond D",
    farmId: "RV-FARM-TH-001045",
    species: "Vannamei",
    totalWeightKg: 12500,
  },
  "AH-2025-12-002": {
    id: "AH-2025-12-002",
    harvestDate: "2025-12-08",
    pondId: "RV-POND-02",
    pondName: "Pond B",
    farmId: "RV-FARM-TH-001045",
    species: "Black Tiger",
    totalWeightKg: 8200,
  },
};

const CRATES = {
  "RV-CRATE-0001": {
    crateCode: "RV-CRATE-0001",
    harvestId: "AH-2025-12-001",
    grossWeightKg: 32.5,
    grade: "A",
    notes: "Uniform size, export lot A1.",
  },
  "RV-CRATE-0002": {
    crateCode: "RV-CRATE-0002",
    harvestId: "AH-2025-12-001",
    grossWeightKg: 30.8,
    grade: "A",
    notes: "Slight size variation in bottom layer.",
  },
  "RV-CRATE-0003": {
    crateCode: "RV-CRATE-0003",
    harvestId: "AH-2025-12-002",
    grossWeightKg: 28.2,
    grade: "Mixed",
    notes: "Mixed grade for domestic lot.",
  },
};

function GradePill({ grade }) {
  let cls =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ";

  if (grade === "A") {
    cls += "bg-emerald-50 text-emerald-700 border border-emerald-100";
  } else if (grade === "Mixed") {
    cls += "bg-amber-50 text-amber-700 border border-amber-100";
  } else {
    cls += "bg-slate-50 text-slate-700 border border-slate-100";
  }

  return <span className={cls}>{grade || "Ungraded"}</span>;
}

export default function TraceabilityLookupPage() {
  const [crateCode, setCrateCode] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = (e) => {
    e.preventDefault();

    const trimmed = crateCode.trim().toUpperCase();
    if (!trimmed) return;

    const crate = CRATES[trimmed];
    if (!crate) {
      setResult(null);
      setNotFound(true);
      return;
    }

    const harvest = HARVEST_BATCHES[crate.harvestId] || null;
    const pond = harvest ? PONDS[harvest.pondId] || null : null;

    setResult({
      crate,
      harvest,
      pond,
    });
    setNotFound(false);
  };

  const cardShell =
    "rounded-2xl border border-sky-100 bg-white p-4 shadow-md";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Outer shell */}
      <div className="rounded-2xl bg-white border border-sky-100 shadow-md p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Crate Traceability Lookup
            </h1>
            <p className="text-xs text-slate-600">
              Enter a Crate Code from the QR label to view full harvest and
              pond history.
            </p>
          </div>
        </div>

        {/* Lookup form */}
        <form
          onSubmit={handleLookup}
          className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3"
        >
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={crateCode}
              onChange={(e) => setCrateCode(e.target.value)}
              placeholder="e.g. RV-CRATE-0001"
              className="w-full rounded-md border border-slate-200 bg-white pl-7 pr-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-400"
          >
            <FiSearch className="text-sm" />
            <span>Lookup</span>
          </button>
        </form>

        {notFound && (
          <div className="flex items-center gap-2 text-xs text-rose-700 rounded-md bg-rose-50 border border-rose-100 px-3 py-2">
            <FiAlertTriangle className="text-[14px]" />
            <span>No crate found for that code. Check the label and try again.</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="grid gap-3 md:grid-cols-3">
            {/* Crate card */}
            <section className={cardShell}>
              <div className="flex items-center gap-2 mb-2">
                <FiPackage className="text-cyan-600 text-base" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Crate Details
                </h2>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <p className="text-xs text-slate-600">Crate Code</p>
                  <p className="text-slate-900 font-medium">
                    {result.crate.crateCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Gross Weight</p>
                  <p className="text-slate-900">
                    {result.crate.grossWeightKg} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Grade</p>
                  <GradePill grade={result.crate.grade} />
                </div>
                {result.crate.notes && (
                  <div>
                    <p className="text-xs text-slate-600">Notes</p>
                    <p className="text-[11px] text-slate-700">
                      {result.crate.notes}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Harvest card */}
            <section className={cardShell}>
              <div className="flex items-center gap-2 mb-2">
                <FiLayers className="text-violet-600 text-base" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Harvest Batch
                </h2>
              </div>
              {result.harvest ? (
                <div className="space-y-1 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Harvest ID</p>
                    <p className="text-slate-900 font-medium">
                      {result.harvest.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Harvest Date</p>
                    <p className="text-slate-900">
                      {result.harvest.harvestDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Species</p>
                    <p className="text-slate-900">
                      {result.harvest.species}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Pond</p>
                    <p className="text-slate-900 flex items-center gap-1">
                      <FiLayers className="text-[12px] text-violet-600" />
                      <span>
                        {result.harvest.pondId} · {result.harvest.pondName}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Total Batch Weight</p>
                    <p className="text-slate-900">
                      {result.harvest.totalWeightKg.toLocaleString()} kg
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Harvest batch not found for this crate.
                </p>
              )}
            </section>

            {/* Pond / Farm card */}
            <section className={cardShell}>
              <div className="flex items-center gap-2 mb-2">
                <FiMapPin className="text-emerald-600 text-base" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Pond & Farm
                </h2>
              </div>
              {result.pond ? (
                <div className="space-y-1 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Pond</p>
                    <p className="text-slate-900 flex items-center gap-1">
                      <FiLayers className="text-[12px] text-sky-600" />
                      <span>
                        {result.pond.id} · {result.pond.name}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Species</p>
                    <p className="text-slate-900 flex items-center gap-1">
                      <FiDroplet className="text-[12px] text-sky-600" />
                      <span>{result.pond.species}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Farm ID</p>
                    <p className="text-slate-900">{result.pond.farmId}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Pond details not available for this harvest.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
    