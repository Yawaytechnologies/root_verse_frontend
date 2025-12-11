// src/components/Aquaculture/FeedLogForm.jsx
import React, { useState } from "react";
import { FiLayers, FiEdit3, FiClock, FiHash, FiX } from "react-icons/fi";

const cardShell =
  "rounded-2xl border border-sky-100 bg-white p-4 shadow-md";

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm focus:shadow-md";

// Fallback ponds – in real app, pass pondOptions from parent
const defaultPonds = [
  { value: "RV-POND-01", label: "RV-POND-01 · Pond A" },
  { value: "RV-POND-02", label: "RV-POND-02 · Pond B" },
  { value: "RV-POND-03", label: "RV-POND-03 · Pond C" },
  { value: "RV-POND-04", label: "RV-POND-04 · Pond D" },
  { value: "RV-POND-05", label: "RV-POND-05 · Pond E" },
  { value: "RV-POND-06", label: "RV-POND-06 · Pond F" },
];

export default function FeedLogForm({
  onClose,
  onSave,
  initialData,
  pondOptions,
}) {
  const isEdit = Boolean(initialData);
  const ponds = pondOptions && pondOptions.length ? pondOptions : defaultPonds;

  const [pondId, setPondId] = useState(
    initialData?.pondId || initialData?.pond || ponds[0]?.value || ""
  );

  const [feedType, setFeedType] = useState(initialData?.feedType || "");
  const [quantityKg, setQuantityKg] = useState(
    initialData?.quantityKg?.toString() ||
      initialData?.qty?.toString() ||
      ""
  );

  const [time, setTime] = useState(
    initialData?.time || new Date().toTimeString().slice(0, 5)
  );

  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().slice(0, 10)
  );

  const [notes, setNotes] = useState(initialData?.notes || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    const qtyNumber = Number(quantityKg);
    const safeQty = Number.isNaN(qtyNumber)
      ? 0
      : Math.max(0, qtyNumber);

    const payload = {
      ...(initialData?.id && { id: initialData.id }),
      pondId,
      date,
      time,
      feedType: feedType.trim(),
      quantityKg: safeQty,
      notes: notes.trim(),
    };

    if (onSave) onSave(payload);
  };

  return (
    <div className={cardShell}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiLayers className="text-sky-600 text-base" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {isEdit ? "Edit Feed Log" : "Add Feed Log"}
            </h2>
            <p className="text-[11px] text-slate-600">
              Record feed given to each pond.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <FiX className="text-sm" />
        </button>
      </div>

      <form className="space-y-3 text-sm" onSubmit={handleSubmit}>
        {/* Date + Time */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Date
            </label>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              <span className="inline-flex items-center gap-1">
                <FiClock className="text-[12px] text-slate-500" />
                <span>Feeding Time</span>
              </span>
            </label>
            <input
              type="time"
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Pond */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            <span className="inline-flex items-center gap-1">
              <FiHash className="text-[12px] text-slate-500" />
              <span>Select Pond</span>
            </span>
          </label>
          <select
            className={inputClass}
            value={pondId}
            onChange={(e) => setPondId(e.target.value)}
          >
            {ponds.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Feed type */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            <span className="inline-flex items-center gap-1">
              <FiEdit3 className="text-[12px] text-slate-500" />
              <span>Feed Type</span>
            </span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. CP 35% pellet"
            value={feedType}
            onChange={(e) => setFeedType(e.target.value)}
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Quantity (kg)
          </label>
          <input
            type="number"
            className={inputClass}
            placeholder="e.g. 18.5"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            min="0"
            step="0.1"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Notes
          </label>
          <textarea
            rows="3"
            className={inputClass}
            placeholder="Optional: appetite, behaviour, bottom visibility, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400"
          >
            {isEdit ? "Update Feed Log" : "Save Feed Log"}
          </button>
        </div>
      </form>
    </div>
  );
}
