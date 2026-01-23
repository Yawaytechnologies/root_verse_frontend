import { useState } from "react";

export default function LandingSummary({ trip, onSubmit, loading }) {
  const [form, setForm] = useState({
    landingPort: "",
    actualWeightKg: "",
    qcPassed: true,
    temperatureC: "",
  });

  if (!trip) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-xs text-slate-500">
        Create or select a trip to record landing details.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3"
    >
      <h2 className="text-sm font-semibold text-slate-800 mb-1">
        Landing & QC – Trip #{trip.code || trip.id}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Landing Port
          </label>
          <input
            name="landingPort"
            value={form.landingPort}
            onChange={handleChange}
            placeholder="Thoothukudi Harbour"
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Actual Landed Weight (kg)
          </label>
          <input
            name="actualWeightKg"
            type="number"
            step="0.1"
            value={form.actualWeightKg}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Temperature at Landing (°C)
          </label>
          <input
            name="temperatureC"
            type="number"
            step="0.1"
            value={form.temperatureC}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center mt-4 md:mt-6">
          <input
            id="qcPassed"
            name="qcPassed"
            type="checkbox"
            checked={form.qcPassed}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label
            htmlFor="qcPassed"
            className="ml-2 text-xs font-medium text-slate-700"
          >
            QC Passed
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Landing Details"}
      </button>
    </form>
  );
}
