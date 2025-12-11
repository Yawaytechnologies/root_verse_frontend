// src/pages/Aquapage/WaterLogPage.jsx
import React, { useState } from "react";
import {
  FiDroplet,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import WaterLogForm from "../../components/Aquaculture/WaterLogForm";

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

const initialWaterLogs = [
  {
    id: "wl-1",
    pondId: "RV-POND-01",
    date: "2025-12-09",
    time: "07:30",
    temperatureC: 28.4,
    ph: 7.8,
    dissolvedOxygenMgL: 5.9,
    salinityPpt: 14.5,
    transparencyCm: 32,
    notes: "",
    isVoided: false,
  },
  {
    id: "wl-2",
    pondId: "RV-POND-02",
    date: "2025-12-09",
    time: "07:35",
    temperatureC: 28.1,
    ph: 7.7,
    dissolvedOxygenMgL: 5.8,
    salinityPpt: 15.0,
    transparencyCm: 30,
    notes: "",
    isVoided: false,
  },
  {
    id: "wl-3",
    pondId: "RV-POND-04",
    date: "2025-12-08",
    time: "07:25",
    temperatureC: 27.9,
    ph: 7.6,
    dissolvedOxygenMgL: 5.7,
    salinityPpt: 14.8,
    transparencyCm: 28,
    notes: "",
    isVoided: false,
  },
  {
    id: "wl-4",
    pondId: "RV-POND-03",
    date: "2025-12-08",
    time: "07:40",
    temperatureC: 28.0,
    ph: 7.7,
    dissolvedOxygenMgL: 6.0,
    salinityPpt: 14.9,
    transparencyCm: 31,
    notes: "",
    isVoided: false,
  },
  {
    id: "wl-5",
    pondId: "RV-POND-05",
    date: "2025-12-07",
    time: "07:20",
    temperatureC: 27.6,
    ph: 7.5,
    dissolvedOxygenMgL: 5.6,
    salinityPpt: 14.2,
    transparencyCm: 29,
    notes: "",
    isVoided: false,
  },
  {
    id: "wl-6",
    pondId: "RV-POND-06",
    date: "2025-12-07",
    time: "07:50",
    temperatureC: 27.8,
    ph: 7.6,
    dissolvedOxygenMgL: 5.7,
    salinityPpt: 14.4,
    transparencyCm: 27,
    notes: "",
    isVoided: false,
  },
  {
    id: "wl-7",
    pondId: "RV-POND-01",
    date: "2025-12-06",
    time: "07:30",
    temperatureC: 27.9,
    ph: 7.6,
    dissolvedOxygenMgL: 6.1,
    salinityPpt: 14.3,
    transparencyCm: 33,
    notes: "",
    isVoided: false,
  },
  {
    id: "wl-8",
    pondId: "RV-POND-02",
    date: "2025-12-06",
    time: "07:40",
    temperatureC: 28.2,
    ph: 7.8,
    dissolvedOxygenMgL: 5.5,
    salinityPpt: 15.1,
    transparencyCm: 26,
    notes: "",
    isVoided: false,
  },
];

const ITEMS_PER_PAGE = 6;

export default function WaterLogPage() {
  const [showForm, setShowForm] = useState(false);
  const [waterLogs, setWaterLogs] = useState(initialWaterLogs);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPond, setFilterPond] = useState("all");

  const handleAddClick = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (log) => {
    setEditingId(log.id);
    setShowForm(true);
  };

  // Soft delete: mark as voided
  const handleDeleteClick = (log) => {
    setWaterLogs((prev) =>
      prev.map((item) =>
        item.id === log.id ? { ...item, isVoided: true } : item
      )
    );
  };

  const handleSaveLog = (payload) => {
    setWaterLogs((prev) => {
      if (payload.id) {
        // Edit existing
        return prev.map((log) =>
          log.id === payload.id ? { ...log, ...payload } : log
        );
      }
      // New log
      const newLog = {
        ...payload,
        id: `wl-${Date.now()}`,
        isVoided: false,
      };
      return [newLog, ...prev];
    });

    setShowForm(false);
    setEditingId(null);
    setCurrentPage(1);
  };

  const currentEditingLog = editingId
    ? waterLogs.find((log) => log.id === editingId) || null
    : null;

  // Pond options for filter (non-voided logs)
  const pondFilterOptions = Array.from(
    new Set(
      waterLogs
        .filter((log) => !log.isVoided)
        .map((log) => log.pondId)
    )
  );

  // Search + filter (ignore voided)
  const filteredLogs = waterLogs.filter((log) => {
    if (log.isVoided) return false;

    const pondLabel = getPondLabel(log.pondId);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        pondLabel.toLowerCase().includes(q) ||
        log.date.toLowerCase().includes(q) ||
        (log.time || "").toLowerCase().includes(q) ||
        String(log.temperatureC).toLowerCase().includes(q) ||
        String(log.ph).toLowerCase().includes(q) ||
        String(log.dissolvedOxygenMgL).toLowerCase().includes(q) ||
        String(log.salinityPpt).toLowerCase().includes(q) ||
        String(log.transparencyCm).toLowerCase().includes(q) ||
        (log.notes || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;
    }

    if (filterPond !== "all" && log.pondId !== filterPond) {
      return false;
    }

    return true;
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
        {/* Header with button */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Water Quality Logs
            </h1>
            <p className="text-xs text-slate-600">
              Record and review daily pond water parameters.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-1 rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400"
          >
            <FiPlus className="text-sm" />
            <span>Add Water Quality Log</span>
          </button>
        </div>

        {/* Section heading + search + filter */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FiDroplet className="text-sky-600 text-base" />
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Water Logs
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
            <span className="text-xs text-slate-600">
              Total logs: {filteredLogs.length}
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
                placeholder="Search logs..."
                className="w-40 md:w-56 rounded-md border border-slate-200 bg-white pl-7 pr-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              />
            </div>

            {/* Filter ponds */}
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              value={filterPond}
              onChange={(e) => {
                setFilterPond(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All ponds</option>
              {pondFilterOptions.map((pondId) => (
                <option key={pondId} value={pondId}>
                  {getPondLabel(pondId)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards grid */}
        {pageLogs.length > 0 ? (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            {pageLogs.map((log) => {
              const pondLabel = getPondLabel(log.pondId);
              return (
                <div
                  key={log.id}
                  className="flex flex-col rounded-lg bg-sky-50 px-3 py-2 border border-sky-100"
                >
                  <p className="text-slate-900">{pondLabel}</p>
                  <p className="text-[11px] text-slate-600">
                    {log.date} · {log.time}
                  </p>
                  <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-slate-800">
                    <span>Temp: {log.temperatureC}°C</span>
                    <span>pH: {log.ph}</span>
                    <span>DO: {log.dissolvedOxygenMgL} mg/L</span>
                    <span>Sal: {log.salinityPpt} ppt</span>
                    <span>Trans: {log.transparencyCm} cm</span>
                  </div>
                  {log.notes && (
                    <p className="text-[11px] text-slate-600 mt-1">
                      {log.notes}
                    </p>
                  )}

                  {/* Edit / Delete */}
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
            No water logs match your search / filter.
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
            <WaterLogForm
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
