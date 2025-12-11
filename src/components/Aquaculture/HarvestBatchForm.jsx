import React, { useState } from "react";
import { FiActivity, FiPackage, FiEdit3, FiClock, FiX } from "react-icons/fi";

const cardShell = "rounded-2xl border border-sky-100 bg-white p-4 shadow-md";

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

export default function HarvestBatchForm({
  onClose,
  onSave,
  initialData,
  pondOptions,
}) {
  const isEdit = Boolean(initialData);
  const ponds = pondOptions && pondOptions.length ? pondOptions : defaultPonds;

  const [harvestDate, setHarvestDate] = useState(
    initialData?.harvestDate || new Date().toISOString().slice(0, 10)
  );
  const [harvestTime, setHarvestTime] = useState(
    initialData?.harvestTime || new Date().toTimeString().slice(0, 5)
  );
  const [pondId, setPondId] = useState(
    initialData?.pondId || ponds[0]?.value || ""
  );

  const [estimatedBiomassTon, setEstimatedBiomassTon] = useState(
    initialData?.estimatedBiomassTon?.toString() || ""
  );
  const [avgWeightGrams, setAvgWeightGrams] = useState(
    initialData?.avgWeightGrams?.toString() || ""
  );
  const [survivalPercent, setSurvivalPercent] = useState(
    initialData?.survivalPercent?.toString() || ""
  );
  const [totalCount, setTotalCount] = useState(
    initialData?.totalCount?.toString() || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");

  const toNumberOrNull = (val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...(initialData?.id && { id: initialData.id }),
      pondId,
      harvestDate,
      harvestTime,
      estimatedBiomassTon: toNumberOrNull(estimatedBiomassTon),
      avgWeightGrams: toNumberOrNull(avgWeightGrams),
      survivalPercent: toNumberOrNull(survivalPercent),
      totalCount: toNumberOrNull(totalCount),
      notes: notes.trim(),
    };

    if (onSave) onSave(payload);
  };

  return (
    <div className={cardShell}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiPackage className="text-emerald-600 text-base" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {isEdit ? "Edit Harvest Batch" : "Create Harvest Batch"}
            </h2>
            <p className="text-[11px] text-slate-600">
              Link a pond&apos;s harvest to traceability (biomass, survival,
              notes).
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
              Harvest Date
            </label>
            <input
              type="date"
              className={inputClass}
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              <span className="inline-flex items-center gap-1">
                <FiClock className="text-[12px] text-slate-500" />
                <span>Harvest Time</span>
              </span>
            </label>
            <input
              type="time"
              className={inputClass}
              value={harvestTime}
              onChange={(e) => setHarvestTime(e.target.value)}
            />
          </div>
        </div>

        {/* Pond + Biomass */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Select Pond
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

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Estimated Biomass (T)
            </label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="e.g. 3.2"
              value={estimatedBiomassTon}
              onChange={(e) => setEstimatedBiomassTon(e.target.value)}
            />
          </div>
        </div>

        {/* Avg weight + Survival */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Avg Weight (g){" "}
              <span className="text-[11px] text-slate-500">(optional)</span>
            </label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              placeholder="e.g. 22.5"
              value={avgWeightGrams}
              onChange={(e) => setAvgWeightGrams(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Survival (%){" "}
              <span className="text-[11px] text-slate-500">(optional)</span>
            </label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              placeholder="e.g. 90"
              value={survivalPercent}
              onChange={(e) => setSurvivalPercent(e.target.value)}
            />
          </div>
        </div>

        {/* Total count */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Total Count (optional)
          </label>
          <input
            type="number"
            className={inputClass}
            placeholder="e.g. 120000"
            value={totalCount}
            onChange={(e) => setTotalCount(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">Notes</label>
          <textarea
            rows="3"
            className={inputClass}
            placeholder="Optional: grading, buyer, remarks about size or quality."
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
            className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            {isEdit ? "Update Harvest Batch" : "Save Harvest Batch"}
          </button>
        </div>
      </form>
    </div>
  );
}
