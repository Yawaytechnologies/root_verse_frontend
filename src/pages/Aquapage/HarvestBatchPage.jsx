// src/pages/Aquapage/HarvestBatchPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiLayers,
  FiCalendar,
  FiMapPin,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

const initialBatches = [
  {
    id: "AH-2025-12-001",
    harvestDate: "2025-12-09",
    pondId: "RV-POND-04",
    pondName: "Pond D",
    farmId: "RV-FARM-TH-001045",
    species: "Vannamei",
    totalWeightKg: 12_500,
    cratesCount: 24,
    status: "Open",
    notes: "First harvest cut for export lot.",
  },
  {
    id: "AH-2025-12-002",
    harvestDate: "2025-12-08",
    pondId: "RV-POND-02",
    pondName: "Pond B",
    farmId: "RV-FARM-TH-001045",
    species: "Black Tiger",
    totalWeightKg: 8_200,
    cratesCount: 18,
    status: "Closed",
    notes: "Completed lot, all crates assigned.",
  },
];

const ITEMS_PER_PAGE = 6;

const statusClass = (status) => {
  if (status === "Open")
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (status === "Closed")
    return "bg-slate-50 text-slate-700 border border-slate-200";
  return "bg-amber-50 text-amber-700 border border-amber-100";
};

export default function HarvestBatchPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState(initialBatches);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleEditClick = (batch) => {
    // placeholder – later you can hook to a form modal / page
    console.log("Edit batch", batch.id);
  };

  const handleDeleteClick = (batch) => {
    setBatches((prev) => prev.filter((b) => b.id !== batch.id));
  };

  // search + filter
  const filteredBatches = batches.filter((batch) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matches =
        batch.id.toLowerCase().includes(q) ||
        batch.pondId.toLowerCase().includes(q) ||
        batch.pondName.toLowerCase().includes(q) ||
        batch.farmId.toLowerCase().includes(q) ||
        batch.species.toLowerCase().includes(q) ||
        (batch.notes || "").toLowerCase().includes(q) ||
        batch.harvestDate.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (filterStatus !== "all" && batch.status !== filterStatus) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBatches.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageBatches = filteredBatches.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Outer card */}
      <div className="rounded-2xl bg-white border border-sky-100 shadow-md p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Harvest Batches
            </h1>
            <p className="text-xs text-slate-600">
              Pond-level harvest events grouped into batches for crates and
              shipments.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400"
          >
            <FiPlus className="text-sm" />
            <span>Add Harvest Batch</span>
          </button>
        </div>

        {/* Filters / search */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FiPackage className="text-violet-600 text-base" />
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Harvests
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
            <span className="text-xs text-slate-600">
              Total batches: {filteredBatches.length}
            </span>

            {/* Search */}
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by batch, pond, farm..."
                className="w-40 md:w-56 rounded-md border border-slate-200 bg-white pl-7 pr-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              />
            </div>

            {/* Status filter */}
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Cards */}
        {pageBatches.length > 0 ? (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {pageBatches.map((batch) => (
              <div
                key={batch.id}
                className="flex flex-col rounded-lg bg-violet-50 px-3 py-3 border border-violet-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">Harvest ID</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {batch.id}
                    </p>
                    <p className="text-[11px] text-slate-700 flex items-center gap-1">
                      <FiCalendar className="text-[12px]" />
                      <span>{batch.harvestDate}</span>
                    </p>
                  </div>
                  <div className="text-right text-[11px] space-y-1">
                    <span
                      className={
                        "inline-flex items-center px-2 py-0.5 rounded-full " +
                        statusClass(batch.status)
                      }
                    >
                      {batch.status}
                    </span>
                    <p className="text-slate-700 mt-1">
                      Total:{" "}
                      <span className="font-semibold">
                        {batch.totalWeightKg.toLocaleString()} kg
                      </span>
                    </p>
                    <p className="text-slate-700">
                      Crates:{" "}
                      <span className="font-semibold">
                        {batch.cratesCount}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p className="text-slate-600">Pond</p>
                    <p className="text-slate-900 flex items-center gap-1">
                      <FiLayers className="text-[12px] text-violet-600" />
                      <span>
                        {batch.pondId} · {batch.pondName}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Farm</p>
                    <p className="text-slate-900 flex items-center gap-1">
                      <FiMapPin className="text-[12px] text-slate-600" />
                      <span>{batch.farmId}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Species</p>
                    <p className="text-slate-900">{batch.species}</p>
                  </div>
                </div>

                {batch.notes && (
                  <p className="mt-2 text-[11px] text-slate-700">
                    {batch.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2 justify-between text-[11px]">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(batch)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
                    >
                      <FiEdit3 className="text-[12px]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(batch)}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50"
                    >
                      <FiTrash2 className="text-[12px]" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* View crates for this batch */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/aquaculture/crates?harvestId=${encodeURIComponent(
                          batch.id
                        )}`
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-violet-400 px-3 py-1.5 text-violet-800 hover:bg-violet-50"
                  >
                    <FiPackage className="text-[12px]" />
                    <span>View Crates</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-4">
            No harvest batches match your search / filter.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`rounded-md border px-3 py-1 ${
                  currentPage === 1
                    ? "border-slate-200 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`rounded-md border px-3 py-1 ${
                  currentPage === totalPages
                    ? "border-slate-200 text-slate-300 cursor-not-allowed"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
