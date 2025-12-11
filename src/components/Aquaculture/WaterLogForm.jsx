// src/components/Aquaculture/WaterLogForm.jsx
import React, { useState } from "react";
import { FiDroplet, FiThermometer, FiEye, FiX } from "react-icons/fi";

const cardShell =
  "rounded-2xl border border-sky-100 bg-white p-4 shadow-md";

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 shadow-sm focus:shadow-md";

// Fallback ponds – ideally pass pondOptions from parent
const defaultPonds = [
  { value: "RV-POND-01", label: "RV-POND-01 · Pond A" },
  { value: "RV-POND-02", label: "RV-POND-02 · Pond B" },
  { value: "RV-POND-03", label: "RV-POND-03 · Pond C" },
  { value: "RV-POND-04", label: "RV-POND-04 · Pond D" },
  { value: "RV-POND-05", label: "RV-POND-05 · Pond E" },
  { value: "RV-POND-06", label: "RV-POND-06 · Pond F" },
];

export default function WaterLogForm({
  onClose,
  onSave,
  initialData,
  pondOptions,
}) {
  const isEdit = Boolean(initialData);
  const ponds = pondOptions && pondOptions.length ? pondOptions : defaultPonds;

  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState(
    initialData?.time || new Date().toTimeString().slice(0, 5)
  );

  const [pondId, setPondId] = useState(
    initialData?.pondId || initialData?.pond || ponds[0]?.value || ""
  );

  const [temperatureC, setTemperatureC] = useState(
    initialData?.temperatureC?.toString() || initialData?.temp?.toString() || ""
  );
  const [ph, setPh] = useState(
    initialData?.ph?.toString() || ""
  );
  const [dissolvedOxygenMgL, setDissolvedOxygenMgL] = useState(
    initialData?.dissolvedOxygenMgL?.toString() || initialData?.do?.toString() || ""
  );
  const [salinityPpt, setSalinityPpt] = useState(
    initialData?.salinityPpt?.toString() || initialData?.salinity?.toString() || ""
  );
  const [transparencyCm, setTransparencyCm] = useState(
    initialData?.transparencyCm?.toString() || initialData?.transparency?.toString() || ""
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
      date,
      time,
      temperatureC: toNumberOrNull(temperatureC),
      ph: toNumberOrNull(ph),
      dissolvedOxygenMgL: toNumberOrNull(dissolvedOxygenMgL),
      salinityPpt: toNumberOrNull(salinityPpt),
      transparencyCm: toNumberOrNull(transparencyCm),
      notes: notes.trim(),
    };

    if (onSave) onSave(payload);
  };

  return (
    <div className={cardShell}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiDroplet className="text-sky-600 text-base" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {isEdit ? "Edit Water Quality Log" : "Add Water Quality Log"}
            </h2>
            <p className="text-[11px] text-slate-600">
              Record today&apos;s pond readings.
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

        {/* Pond */}
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

        {/* Main parameters grid */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              <span className="inline-flex items-center gap-1">
                <FiThermometer className="text-[12px] text-slate-500" />
                <span>Temperature (°C)</span>
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={temperatureC}
              onChange={(e) => setTemperatureC(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">pH</label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={ph}
              onChange={(e) => setPh(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Dissolved Oxygen (mg/L)
            </label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={dissolvedOxygenMgL}
              onChange={(e) => setDissolvedOxygenMgL(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Salinity (ppt){" "}
              <span className="text-slate-500 text-[11px]">(optional)</span>
            </label>
            <input
              type="number"
              step="0.1"
              className={inputClass}
              value={salinityPpt}
              onChange={(e) => setSalinityPpt(e.target.value)}
            />
          </div>
        </div>

        {/* Transparency */}
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            <span className="inline-flex items-center gap-1">
              <FiEye className="text-[12px] text-slate-500" />
              <span>Transparency (cm)</span>
            </span>{" "}
            <span className="text-slate-500 text-[11px]">(optional)</span>
          </label>
          <input
            type="number"
            className={inputClass}
            value={transparencyCm}
            onChange={(e) => setTransparencyCm(e.target.value)}
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
            placeholder="Optional: weather, colour, odour etc."
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
            {isEdit ? "Update Water Log" : "Save Water Log"}
          </button>
        </div>
      </form>
    </div>
  );
}
