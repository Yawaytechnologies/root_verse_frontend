// src/components/wildCapture/TripForm.jsx
import React, { useState } from "react";

const initialState = {
  tripId: "",
  vesselId: "",
  vesselName: "",
  captain: "",
  departurePort: "",
  targetSpecies: "",
  method: "",
  departureAt: "",
  faoZone: "",
};

export default function TripForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTrip = {
      id: form.tripId || `TRIP-${Date.now()}`,
      vesselId: form.vesselId,
      vesselName: form.vesselName,
      captain: form.captain,
      departurePort: form.departurePort,
      targetSpecies: form.targetSpecies,
      method: form.method,
      departureAt: form.departureAt,
      landingAt: null,
      status: "At sea",
      totalCatchKg: null,
      faoZone: form.faoZone,
    };

    if (onSubmit) onSubmit(newTrip);
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
            placeholder="TRIP-2025-012"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Vessel ID (RootVerse)
          </label>
          <input
            name="vesselId"
            value={form.vesselId}
            onChange={handleChange}
            placeholder="RV-VES-0234"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Vessel Name
          </label>
          <input
            name="vesselName"
            value={form.vesselName}
            onChange={handleChange}
            placeholder="St. Mary III"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Captain Name
          </label>
          <input
            name="captain"
            value={form.captain}
            onChange={handleChange}
            placeholder="Jane Cooper"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Departure Port
          </label>
          <input
            name="departurePort"
            value={form.departurePort}
            onChange={handleChange}
            placeholder="Rameswaram"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Departure Date & Time
          </label>
          <input
            type="datetime-local"
            name="departureAt"
            value={form.departureAt}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Target Species
          </label>
          <input
            name="targetSpecies"
            value={form.targetSpecies}
            onChange={handleChange}
            placeholder="Yellowfin Tuna"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Allowed Fishing Method
          </label>
          <select
            name="method"
            value={form.method}
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
          Save Trip
        </button>
      </div>
    </form>
  );
}
