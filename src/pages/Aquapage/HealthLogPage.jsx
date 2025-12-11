// src/pages/Aquapage/HealthLogPage.jsx
import React, { useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
// Make sure this import path matches your folder structure
import HealthLogForm from "../../components/Aquaculture/HealthLogForm";

// Shared pond options (same as in HealthLogForm)
const POND_OPTIONS = [
  { value: "RV-POND-01", label: "RV-POND-01 · Pond A" },
  { value: "RV-POND-02", label: "RV-POND-02 · Pond B" },
  { value: "RV-POND-03", label: "RV-POND-03 · Pond C" },
  { value: "RV-POND-04", label: "RV-POND-04 · Pond D" },
  { value: "RV-POND-05", label: "RV-POND-05 · Pond E" },
  { value: "RV-POND-06", label: "RV-POND-06 · Pond F" },
];

const getPondLabel = (pondId) =>
  POND_OPTIONS.find((p) => p.value === pondId)?.label || pondId;

// Dummy initial data in the new schema
const initialHealthLogs = [
  {
    id: "hl-1",
    pondId: "RV-POND-03",
    date: "2025-12-07",
    time: "08:30",
    mortality: 42,
    healthStatus: "disease_signs",
    symptoms: "Reduced feeding, surface swimming",
    cause: "Likely bacterial issue post-rain",
    treatmentApplied: true,
    treatment: "Vitamin C + probiotic in feed × 3 days",
    isVoided: false,
  },
  {
    id: "hl-2",
    pondId: "RV-POND-01",
    date: "2025-12-03",
    time: "09:15",
    mortality: 15,
    healthStatus: "stress",
    symptoms: "Mild gill discolouration",
    cause: "Low DO in early morning",
    treatmentApplied: true,
    treatment: "Partial water exchange + zeolite broadcasting",
    isVoided: false,
  },
  {
    id: "hl-3",
    pondId: "RV-POND-02",
    date: "2025-12-01",
    time: "07:50",
    mortality: 8,
    healthStatus: "stress",
    symptoms: "Slight size variation, slow growth",
    cause: "Underfeeding + crowding",
    treatmentApplied: true,
    treatment: "Feed adjustment + mineral mix",
    isVoided: false,
  },
  {
    id: "hl-4",
    pondId: "RV-POND-04",
    date: "2025-11-28",
    time: "10:05",
    mortality: 5,
    healthStatus: "normal",
    symptoms: "Normal feeding, slight stress post-handling",
    cause: "",
    treatmentApplied: false,
    treatment: null,
    isVoided: false,
  },
];

const ITEMS_PER_PAGE = 6;

function HealthStatusPill({ status }) {
  let label = "Normal";
  let cls =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ";

  if (status === "normal") {
    label = "Normal / Active";
    cls += "bg-emerald-50 text-emerald-700 border border-emerald-100";
  } else if (status === "stress") {
    label = "Stress / Reduced feeding";
    cls += "bg-amber-50 text-amber-700 border border-amber-100";
  } else if (status === "disease_signs") {
    label = "Disease signs observed";
    cls += "bg-rose-50 text-rose-700 border border-rose-100";
  } else if (status === "emergency") {
    label = "Emergency / High mortality";
    cls += "bg-red-50 text-red-700 border border-red-100";
  }

  return <span className={cls}>{label}</span>;
}

export default function HealthLogPage() {
  const [showForm, setShowForm] = useState(false);
  const [healthLogs, setHealthLogs] = useState(initialHealthLogs);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddClick = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (log) => {
    setEditingId(log.id);
    setShowForm(true);
  };

  // Soft delete: mark log as voided, don't actually remove
  const handleDeleteClick = (log) => {
    setHealthLogs((prev) => prev.map((item) =>
      item.id === log.id ? { ...item, isVoided: true } : item
    ));
    // Optional: adjust page if everything on this page got voided
  };

  const handleSaveLog = (payload) => {
    setHealthLogs((prev) => {
      // Editing existing
      if (payload.id) {
        return prev.map((log) =>
          log.id === payload.id ? { ...log, ...payload } : log
        );
      }

      // Creating new
      const newLog = {
        ...payload,
        id: `hl-${Date.now()}`, // simple frontend-only ID
        isVoided: false,
      };

      // Add new at top
      return [newLog, ...prev];
    });

    setShowForm(false);
    setEditingId(null);
    setCurrentPage(1); // jump to first page to see latest
  };

  const currentEditingLog = editingId
    ? healthLogs.find((log) => log.id === editingId) || null
    : null;

  // Filter logs: search + exclude voided
  const filteredLogs = healthLogs.filter((log) => {
    if (log.isVoided) return false; // hide voided logs by default

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();

    const pondLabel = getPondLabel(log.pondId).toLowerCase();

    return (
      pondLabel.includes(q) ||
      log.date.toLowerCase().includes(q) ||
      (log.time || "").toLowerCase().includes(q) ||
      String(log.mortality).includes(q) ||
      (log.symptoms || "").toLowerCase().includes(q) ||
      (log.treatment || "").toLowerCase().includes(q) ||
      (log.cause || "").toLowerCase().includes(q) ||
      (log.healthStatus || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Outer white panel */}
      <div className="rounded-2xl bg-white border border-sky-100 shadow-md p-4 space-y-4">
        {/* Header with button on top-right */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Health & Mortality Logs
            </h1>
            <p className="text-xs text-slate-600">
              Track pond health events, mortality and treatments.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-1 rounded-md bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400"
          >
            <FiPlus className="text-sm" />
            <span>Add Health / Mortality Log</span>
          </button>
        </div>

        {/* Section heading + search */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FiActivity className="text-emerald-600 text-base" />
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Health Events
            </h2>
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-end">
            <span className="text-xs text-slate-600">
              Total events: {filteredLogs.length}
            </span>

            {/* 🔍 Search bar */}
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset page on new search
                }}
                placeholder="Search logs..."
                className="w-40 md:w-56 rounded-md border border-slate-200 bg-white pl-7 pr-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* side-by-side logs: 2 columns on md+ */}
        {pageLogs.length > 0 ? (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {pageLogs.map((log) => {
              const pondLabel = getPondLabel(log.pondId);
              return (
                <div
                  key={log.id}
                  className="flex flex-col rounded-lg bg-amber-50/70 px-3 py-2 border border-amber-100"
                >
                  <div className="flex gap-2">
                    <FiAlertTriangle className="mt-[2px] text-amber-600 text-sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-slate-900">{pondLabel}</p>
                          <p className="text-[11px] text-slate-700">
                            {log.date} {log.time && `• ${log.time}`}
                          </p>
                        </div>
                        <HealthStatusPill status={log.healthStatus} />
                      </div>

                      <p className="text-[12px] text-slate-800 mt-1">
                        Mortality:{" "}
                        <span className="font-semibold">
                          {log.mortality}
                        </span>
                      </p>

                      {log.symptoms && (
                        <p className="text-[11px] text-slate-700 mt-1">
                          <span className="font-semibold">Symptoms:</span>{" "}
                          {log.symptoms}
                        </p>
                      )}

                      {log.cause && (
                        <p className="text-[11px] text-slate-700">
                          <span className="font-semibold">Cause:</span>{" "}
                          {log.cause}
                        </p>
                      )}

                      {log.treatmentApplied && log.treatment && (
                        <p className="text-[11px] text-slate-700">
                          <span className="font-semibold">Treatment:</span>{" "}
                          {log.treatment}
                        </p>
                      )}
                      {!log.treatmentApplied && (
                        <p className="text-[11px] text-slate-500 italic">
                          No treatment applied – monitored only.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete buttons */}
                  <div className="mt-2 flex justify-end gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleEditClick(log)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
                    >
                      <FiEdit3 className="text-[12px]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(log)}
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
            No health logs match your search.
          </div>
        )}

        {/* Pagination controls */}
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

      {/* Popup form modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-3">
          <div className="w-full max-w-md">
            <HealthLogForm
              onClose={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              onSave={handleSaveLog}
              initialData={currentEditingLog}
              pondOptions={POND_OPTIONS}
            />
          </div>
        </div>
      )}
    </div>
  );
}
