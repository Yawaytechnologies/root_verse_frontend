// src/components/wildCapture/CatchLogForm.jsx
import React, { useState } from "react";

const initialState = {
  tripId: "",
  haulNo: "",
  species: "",
  estWeightKg: "",
  faoZone: "",
  gear: "",
  haulTime: "",
  cratesLinked: "",
};

export default function CatchLogForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newLog = {
      id: Date.now(),
      tripId: form.tripId,
      haulNo: Number(form.haulNo || 1),
      species: form.species,
      estWeightKg: Number(form.estWeightKg || 0),
      faoZone: form.faoZone,
      gear: form.gear,
      haulTime: form.haulTime,
      cratesLinked: Number(form.cratesLinked || 0),
    };

    if (onSubmit) onSubmit(newLog);
    setForm(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Trip ID
          </label>
          <input
            name="tripId"
            value={form.tripId}
            onChange={handleChange}
            placeholder="TRIP-2025-011"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Haul No.
          </label>
          <input
            name="haulNo"
            value={form.haulNo}
            onChange={handleChange}
            placeholder="1"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Haul Time
          </label>
          <input
            type="datetime-local"
            name="haulTime"
            value={form.haulTime}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Species
          </label>
          <input
            name="species"
            value={form.species}
            onChange={handleChange}
            placeholder="Yellowfin Tuna"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Est. Weight (kg)
          </label>
          <input
            name="estWeightKg"
            value={form.estWeightKg}
            onChange={handleChange}
            placeholder="450"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            FAO Zone
          </label>
          <select
            name="faoZone"
            value={form.faoZone}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          >
            <option value="">Select</option>
            <option value="57">Zone 57</option>
            <option value="58">Zone 58</option>
            <option value="71">Zone 71</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Gear
          </label>
          <select
            name="gear"
            value={form.gear}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          >
            <option value="">Select</option>
            <option value="Longline">Longline</option>
            <option value="Gillnet">Gillnet</option>
            <option value="Handline">Handline</option>
            <option value="Purse Seine">Purse Seine</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Crates Linked
          </label>
          <input
            name="cratesLinked"
            value={form.cratesLinked}
            onChange={handleChange}
            placeholder="10"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
        >
          Save Catch Log
        </button>
      </div>
    </form>
  );
}
