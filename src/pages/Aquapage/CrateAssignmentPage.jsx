// src/pages/Aquapage/CrateAssignmentPage.jsx
import React, { useState, useMemo } from "react";
import {
  FiPackage,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import CrateAssignmentForm from "../../components/Aquaculture/CrateAssignmentForm";

const HARVEST_OPTIONS = [
  {
    value: "AH-2025-12-001",
    label: "AH-2025-12-001 · RV-POND-04 · Pond D",
  },
  {
    value: "AH-2025-12-002",
    label: "AH-2025-12-002 · RV-POND-02 · Pond B",
  },
];

const getHarvestLabel = (harvestId) =>
  HARVEST_OPTIONS.find((h) => h.value === harvestId)?.label || harvestId;

const initialCrates = [
  {
    id: "cr-1",
    crateCode: "RV-CRATE-0001",
    harvestId: "AH-2025-12-001",
    grossWeightKg: 32.5,
    grade: "A",
    notes: "Uniform size, export lot A1.",
    isVoided: false,
  },
  {
    id: "cr-2",
    crateCode: "RV-CRATE-0002",
    harvestId: "AH-2025-12-001",
    grossWeightKg: 30.8,
    grade: "A",
    notes: "Slight size variation in bottom layer.",
    isVoided: false,
  },
  {
    id: "cr-3",
    crateCode: "RV-CRATE-0003",
    harvestId: "AH-2025-12-002",
    grossWeightKg: 28.2,
    grade: "Mixed",
    notes: "Mixed grade crate for domestic market.",
    isVoided: false,
  },
];

const ITEMS_PER_PAGE = 6;

function GradePill({ grade }) {
  let cls =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ";

  if (grade === "A") {
    cls += "bg-emerald-50 text-emerald-700 border border-emerald-100";
  } else if (grade === "B") {
    cls += "bg-sky-50 text-sky-700 border border-sky-100";
  } else if (grade === "C") {
    cls += "bg-slate-50 text-slate-700 border border-slate-100";
  } else {
    cls += "bg-amber-50 text-amber-700 border border-amber-100";
  }

  return <span className={cls}>{grade ? `Grade ${grade}` : "Ungraded"}</span>;
}

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

export default function CrateAssignmentPage() {
  const query = useQuery();
  const preSelectedHarvest = query.get("harvestId");

  const [showForm, setShowForm] = useState(false);
  const [crates, setCrates] = useState(initialCrates);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHarvest, setFilterHarvest] = useState(
    preSelectedHarvest || "all"
  );

  const handleAddClick = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (crate) => {
    setEditingId(crate.id);
    setShowForm(true);
  };

  // soft delete – don't actually remove, mark voided
  const handleDeleteClick = (crate) => {
    setCrates((prev) =>
      prev.map((item) =>
        item.id === crate.id ? { ...item, isVoided: true } : item
      )
    );
  };

  const handleSaveCrate = (payload) => {
    setCrates((prev) => {
      if (payload.id) {
        return prev.map((crate) =>
          crate.id === payload.id ? { ...crate, ...payload } : crate
        );
      }

      const newCrate = {
        ...payload,
        id: `cr-${Date.now()}`,
        isVoided: false,
      };

      return [newCrate, ...prev];
    });

    setShowForm(false);
    setEditingId(null);
    setCurrentPage(1);
  };

  const currentEditingCrate = editingId
    ? crates.find((c) => c.id === editingId) || null
    : null;

  // filter options (non-voided)
  const harvestFilterOptions = Array.from(
    new Set(crates.filter((c) => !c.isVoided).map((c) => c.harvestId))
  );

  // search + filter + hide voided
  const filteredCrates = crates.filter((crate) => {
    if (crate.isVoided) return false;

    const harvestLabel = getHarvestLabel(crate.harvestId);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        crate.crateCode.toLowerCase().includes(q) ||
        (crate.grade || "").toLowerCase().includes(q) ||
        (crate.notes || "").toLowerCase().includes(q) ||
        (crate.harvestId || "").toLowerCase().includes(q) ||
        harvestLabel.toLowerCase().includes(q) ||
        String(crate.grossWeightKg ?? "").toLowerCase().includes(q);

      if (!matchesSearch) return false;
    }

    if (filterHarvest !== "all" && crate.harvestId !== filterHarvest) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCrates.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageCrates = filteredCrates.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Outer panel */}
      <div className="rounded-2xl bg-white border border-sky-100 shadow-md p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Crate Assignments
            </h1>
            <p className="text-xs text-slate-600">
              Link physical crates (QR codes) to harvest batches for
              traceability.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-1 rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-400"
          >
            <FiPlus className="text-sm" />
            <span>Assign Crate</span>
          </button>
        </div>

        {/* Heading + search + filter */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FiPackage className="text-cyan-600 text-base" />
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Crate Assignments
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
            <span className="text-xs text-slate-600">
              Total crates: {filteredCrates.length}
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
                placeholder="Search by crate, harvest, grade..."
                className="w-40 md:w-56 rounded-md border border-slate-200 bg-white pl-7 pr-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              />
            </div>

            {/* Filter by harvest */}
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              value={filterHarvest}
              onChange={(e) => {
                setFilterHarvest(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All harvests</option>
              {harvestFilterOptions.map((hid) => (
                <option key={hid} value={hid}>
                  {getHarvestLabel(hid)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards */}
        {pageCrates.length > 0 ? (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {pageCrates.map((crate) => {
              const harvestLabel = getHarvestLabel(crate.harvestId);
              return (
                <div
                  key={crate.id}
                  className="flex flex-col rounded-lg bg-cyan-50 px-3 py-2 border border-cyan-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-600">Crate Code</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {crate.crateCode}
                      </p>
                      <p className="text-[11px] text-slate-700 mt-1">
                        {harvestLabel}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-700 space-y-1">
                      <p>
                        Weight:{" "}
                        <span className="font-semibold">
                          {crate.grossWeightKg ?? "-"} kg
                        </span>
                      </p>
                      <GradePill grade={crate.grade} />
                    </div>
                  </div>

                  {crate.notes && (
                    <p className="text-[11px] text-slate-600 mt-2">
                      {crate.notes}
                    </p>
                  )}

                  {/* Edit / Delete */}
                  <div className="mt-2 flex justify-end gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleEditClick(crate)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
                    >
                      <FiEdit3 className="text-[12px]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(crate)}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50"
                    >
                      <FiTrash2 className="text-[12px]" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-4">
            No crate assignments match your search / filter.
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

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-3">
          <div className="w-full max-w-md">
            <CrateAssignmentForm
              onClose={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              onSave={handleSaveCrate}
              initialData={currentEditingCrate}
              harvestOptions={HARVEST_OPTIONS}
            />
          </div>
        </div>
      )}
    </div>
  );
}
