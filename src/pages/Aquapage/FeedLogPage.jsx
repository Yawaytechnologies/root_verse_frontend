// src/pages/Aquapage/FeedLogPage.jsx
import React, { useState } from "react";
import {
  FiLayers,
  FiEdit3,
  FiClock,
  FiHash,
  FiTrash2,
  FiPlus,
  FiSearch,
} from "react-icons/fi";
import FeedLogForm from "../../components/Aquaculture/FeedLogForm";

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

const initialFeedLogs = [
  {
    id: "fl-1",
    pondId: "RV-POND-02",
    date: "2025-12-09",
    time: "08:30",
    feedType: "CP 35% pellet",
    quantityKg: 18.5,
    notes: "Normal appetite, clear water.",
    isVoided: false,
  },
  {
    id: "fl-2",
    pondId: "RV-POND-04",
    date: "2025-12-08",
    time: "14:10",
    feedType: "Grower 32%",
    quantityKg: 22.0,
    notes: "Slightly reduced feeding, checked DO.",
    isVoided: false,
  },
  {
    id: "fl-3",
    pondId: "RV-POND-03",
    date: "2025-12-08",
    time: "08:20",
    feedType: "Tilapia floating pellet",
    quantityKg: 12.0,
    notes: "Good response, no mortalities.",
    isVoided: false,
  },
  {
    id: "fl-4",
    pondId: "RV-POND-01",
    date: "2025-12-09",
    time: "18:00",
    feedType: "Starter 35%",
    quantityKg: 10.0,
    notes: "Evening top-up, strong feeding response.",
    isVoided: false,
  },
  {
    id: "fl-5",
    pondId: "RV-POND-05",
    date: "2025-12-07",
    time: "08:15",
    feedType: "CP 35% pellet",
    quantityKg: 16.5,
    notes: "Mild surface crowding, normal behaviour.",
    isVoided: false,
  },
  {
    id: "fl-6",
    pondId: "RV-POND-06",
    date: "2025-12-07",
    time: "13:45",
    feedType: "Grower 30%",
    quantityKg: 20.0,
    notes:
      "Slight turbidity after feeding, will check water tomorrow.",
    isVoided: false,
  },
  {
    id: "fl-7",
    pondId: "RV-POND-02",
    date: "2025-12-06",
    time: "07:50",
    feedType: "CP 35% pellet",
    quantityKg: 17.0,
    notes: "Slightly slower response in one corner.",
    isVoided: false,
  },
  {
    id: "fl-8",
    pondId: "RV-POND-03",
    date: "2025-12-06",
    time: "12:30",
    feedType: "Grower 32%",
    quantityKg: 19.5,
    notes: "Midday snack, behaviour normal.",
    isVoided: false,
  },
];

const ITEMS_PER_PAGE = 6;

export default function FeedLogPage() {
  const [showForm, setShowForm] = useState(false);
  const [feedLogs, setFeedLogs] = useState(initialFeedLogs);
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
    setFeedLogs((prev) =>
      prev.map((item) =>
        item.id === log.id ? { ...item, isVoided: true } : item
      )
    );
  };

  const handleSaveLog = (payload) => {
    setFeedLogs((prev) => {
      if (payload.id) {
        // Edit
        return prev.map((log) =>
          log.id === payload.id ? { ...log, ...payload } : log
        );
      }

      // New log
      const newLog = {
        ...payload,
        id: `fl-${Date.now()}`,
        isVoided: false,
      };
      return [newLog, ...prev];
    });

    setShowForm(false);
    setEditingId(null);
    setCurrentPage(1);
  };

  const currentEditingLog = editingId
    ? feedLogs.find((log) => log.id === editingId) || null
    : null;

  // Pond options for filter (from non-voided logs)
  const pondFilterOptions = Array.from(
    new Set(
      feedLogs
        .filter((log) => !log.isVoided)
        .map((log) => log.pondId)
    )
  );

  // Search + filter (ignore voided)
  const filteredLogs = feedLogs.filter((log) => {
    if (log.isVoided) return false;

    const pondLabel = getPondLabel(log.pondId);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        pondLabel.toLowerCase().includes(q) ||
        log.feedType.toLowerCase().includes(q) ||
        (log.notes || "").toLowerCase().includes(q) ||
        log.date.toLowerCase().includes(q) ||
        (log.time || "").toLowerCase().includes(q) ||
        String(log.quantityKg).toLowerCase().includes(q);
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
              Feed Logs
            </h1>
            <p className="text-xs text-slate-600">
              Track daily feed quantity, type, and pond response.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-1 rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400"
          >
            <FiPlus className="text-sm" />
            <span>Add Feed Log</span>
          </button>
        </div>

        {/* Heading + search + filter */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FiLayers className="text-sky-600 text-base" />
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Feed Entries
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
                placeholder="Search feed logs..."
                className="w-40 md:w-56 rounded-md border border-slate-200 bg-white pl-7 pr-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm"
              />
            </div>

            {/* Filter by pond */}
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
                  className="flex flex-col rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-100"
                >
                  <p className="text-slate-900">{pondLabel}</p>
                  <p className="text-[11px] text-slate-600">
                    {log.date} · {log.time}
                  </p>
                  <p className="text-[12px] text-slate-800 mt-1">
                    {log.feedType} – {log.quantityKg} kg
                  </p>
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
            No feed logs match your search / filter.
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
            <FeedLogForm
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
