// src/components/Aquapage/HealthLogForm.jsx
import React, { useState } from "react";
import {
  FiActivity,
  FiHeart,
  FiAlertTriangle,
  FiEdit3,
  FiX,
} from "react-icons/fi";

const cardShell =
  "rounded-2xl border border-sky-100 bg-white p-4 shadow-md";

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 " +
  "shadow-sm focus:shadow-md";

// Fallback static ponds – in real app, pass pondOptions from parent
const defaultPonds = [
  { value: "RV-POND-01", label: "RV-POND-01 · Pond A" },
  { value: "RV-POND-02", label: "RV-POND-02 · Pond B" },
  { value: "RV-POND-03", label: "RV-POND-03 · Pond C" },
  { value: "RV-POND-04", label: "RV-POND-04 · Pond D" },
  { value: "RV-POND-05", label: "RV-POND-05 · Pond E" },
  { value: "RV-POND-06", label: "RV-POND-06 · Pond F" },
];

export default function HealthLogForm({
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

  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().slice(0, 10)
  );

  const [time, setTime] = useState(
    initialData?.time || new Date().toISOString().slice(11, 16) // HH:MM
  );

  const [mortality, setMortality] = useState(
    initialData?.mortality?.toString() || ""
  );

  const [healthStatus, setHealthStatus] = useState(
    initialData?.healthStatus || "normal"
  );

  const [symptoms, setSymptoms] = useState(initialData?.symptoms || "");
const [treatmentApplied, setTreatmentApplied] = useState(
  initialData
    ? initialData.treatmentApplied
      ? "yes"
      : "no"
    : "no"
);

const [treatment, setTreatment] = useState(
  initialData?.treatment ?? ""
);


  const [cause, setCause] = useState(initialData?.cause || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    const mortalityNumber = Number(mortality);
    const safeMortality = Number.isNaN(mortalityNumber)
      ? 0
      : Math.max(0, mortalityNumber);

    const payload = {
      // keep id so parent can update this record
      ...(initialData?.id && { id: initialData.id }),
      pondId,
      date,
      time,
      mortality: safeMortality,
      healthStatus, // structured status
      symptoms,
      cause,
      treatmentApplied: treatmentApplied === "yes",
      treatment:
        treatmentApplied === "yes" && treatment.trim().length > 0
          ? treatment.trim()
          : null,
    };

    if (onSave) onSave(payload);
  };

  return (
    <div className={cardShell}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiHeart className="text-violet-500 text-base" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {isEdit
                ? "Edit Health / Mortality Log"
                : "Add Health / Mortality Log"}
            </h2>
            <p className="text-[11px] text-slate-600">
              Capture mortality, health status, symptoms and treatments.
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
        {/* Row 1: Date + Time */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Date</label>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">Time</label>
            <input
              type="time"
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Row 2: Pond + Health Status */}
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
              Health Status
            </label>
            <select
              className={inputClass}
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value)}
            >
              <option value="normal">Normal / Active</option>
              <option value="stress">Stress / Reduced feeding</option>
              <option value="disease_signs">Disease signs observed</option>
              <option value="emergency">Emergency / High mortality</option>
            </select>
          </div>
        </div>

        {/* Row 3: Mortality + Treatment Applied */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              <span className="inline-flex items-center gap-1">
                <FiAlertTriangle className="text-[12px] text-amber-500" />
                <span>Mortality Count</span>
              </span>
            </label>
            <input
              type="number"
              className={inputClass}
              value={mortality}
              onChange={(e) => setMortality(e.target.value)}
              min="0"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Treatment Applied?
            </label>
            <select
              className={inputClass}
              value={treatmentApplied}
              onChange={(e) => {
                const val = e.target.value;
                setTreatmentApplied(val);
                if (val === "no") {
                  setTreatment("");
                }
              }}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            <span className="inline-flex items-center gap-1">
              <FiActivity className="text-[12px] text-violet-500" />
              <span>Symptoms / Behaviour</span>
            </span>
          </label>
          <textarea
            rows="3"
            className={inputClass}
            placeholder="e.g. lethargy, white spots, surface swimming"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        {/* Suspected Cause */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Suspected Cause (optional)
          </label>
          <textarea
            rows="2"
            className={inputClass}
            placeholder="e.g. sudden temperature drop, poor water exchange"
            value={cause}
            onChange={(e) => setCause(e.target.value)}
          />
        </div>

        {/* Medicine + Dosage */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            <span className="inline-flex items-center gap-1">
              <FiEdit3 className="text-[12px] text-slate-500" />
              <span>Medicine + Dosage</span>
            </span>
          </label>
          <textarea
            rows="2"
            className={inputClass}
            placeholder={
              treatmentApplied === "yes"
                ? "e.g. AquaMix 10g/kg feed × 3 days"
                : "No treatment applied"
            }
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            disabled={treatmentApplied === "no"}
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
            className="rounded-md bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400"
          >
            {isEdit ? "Update Log" : "Save Health Log"}
          </button>
        </div>
      </form>
    </div>
  );
}
