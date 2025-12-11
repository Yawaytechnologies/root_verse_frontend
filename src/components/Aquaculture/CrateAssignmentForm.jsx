// src/components/Aquaculture/CrateAssignmentForm.jsx
import React, { useState } from "react";
import {
  FiPackage,
  FiHash,
  FiEdit3,
  FiX,
} from "react-icons/fi";

const cardShell =
  "rounded-2xl border border-sky-100 bg-white p-4 shadow-md";

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm focus:shadow-md";

// fallback demo harvests – in real app pass harvestOptions from parent
const defaultHarvests = [
  {
    value: "AH-2025-12-001",
    label: "AH-2025-12-001 · RV-POND-04 · Pond D",
  },
  {
    value: "AH-2025-12-002",
    label: "AH-2025-12-002 · RV-POND-02 · Pond B",
  },
];

export default function CrateAssignmentForm({
  onClose,
  onSave,
  initialData,
  harvestOptions,
}) {
  const isEdit = Boolean(initialData);
  const harvests =
    harvestOptions && harvestOptions.length ? harvestOptions : defaultHarvests;

  const [harvestId, setHarvestId] = useState(
    initialData?.harvestId || harvests[0]?.value || ""
  );
  const [crateCode, setCrateCode] = useState(initialData?.crateCode || "");
  const [grossWeightKg, setGrossWeightKg] = useState(
    initialData?.grossWeightKg?.toString() || ""
  );
  const [grade, setGrade] = useState(initialData?.grade || "A");
  const [notes, setNotes] = useState(initialData?.notes || "");

  const toNumberOrNull = (val) => {
    if (!val && val !== 0) return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...(initialData?.id && { id: initialData.id }),
      harvestId,
      crateCode: crateCode.trim(),
      grossWeightKg: toNumberOrNull(grossWeightKg),
      grade,
      notes: notes.trim(),
    };

    if (!payload.crateCode) {
      // minimal frontend guard – no crate without code
      return;
    }

    if (onSave) onSave(payload);
  };

  return (
    <div className={cardShell}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiPackage className="text-amber-600 text-base" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {isEdit ? "Edit Crate Assignment" : "Assign Crate to Harvest"}
            </h2>
            <p className="text-[11px] text-slate-600">
              Link a physical crate (QR) to a harvest batch for traceability.
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
        {/* Harvest select */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Harvest Batch
          </label>
          <select
            className={inputClass}
            value={harvestId}
            onChange={(e) => setHarvestId(e.target.value)}
          >
            {harvests.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        {/* Crate QR / Code */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            <span className="inline-flex items-center gap-1">
              <FiHash className="text-[12px] text-slate-500" />
              <span>Crate QR / Code</span>
            </span>
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Scan or enter crate QR code"
            value={crateCode}
            onChange={(e) => setCrateCode(e.target.value)}
          />
        </div>

        {/* Weight + Grade */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Gross Weight (kg){" "}
              <span className="text-[11px] text-slate-500">(optional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="e.g. 32.5"
              value={grossWeightKg}
              onChange={(e) => setGrossWeightKg(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Grade{" "}
              <span className="text-[11px] text-slate-500">(optional)</span>
            </label>
            <select
              className={inputClass}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Notes
          </label>
          <textarea
            rows="3"
            className={inputClass}
            placeholder="Optional: size notes, buyer, special handling etc."
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
            className="rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-400"
          >
            {isEdit ? "Update Crate" : "Save Crate Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
