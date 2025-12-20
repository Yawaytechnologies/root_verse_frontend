// src/components/admin/wildcapture/VesselRegistration.jsx
import React from "react";
import { FiHash } from "react-icons/fi";

const ALLOWED_METHODS_DEFAULT = ["Trawl", "Gillnet", "Longline", "Purse seine"];

// ✅ Safe default form (prevents "Cannot read properties of undefined")
const SAFE_FORM = {
  vesselId: "",
  govRegNo: "",
  localId: "",
  name: "",
  homePort: "",
  vesselType: "",
  allowedMethods: [],
};

export default function VesselRegistration({
  mode = "create",
  form = SAFE_FORM, // ✅ default
  setForm = () => {}, // ✅ default (prevents crash if missing)
  nextVesselId = "RV-VES-TN-000001", // ✅ default
  allowedMethodsList = ALLOWED_METHODS_DEFAULT,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...(prev || SAFE_FORM), // ✅ protect prev too
      [name]: value,
    }));
  };

  const toggleMethod = (method) => {
    setForm((prev) => {
      const base = prev || SAFE_FORM;
      const list = base.allowedMethods || [];
      const exists = list.includes(method);

      return {
        ...base,
        allowedMethods: exists ? list.filter((m) => m !== method) : [...list, method],
      };
    });
  };

  const vesselIdValue = form?.vesselId || (mode === "create" ? nextVesselId : "");

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900">Vessel Identity</h2>
      <p className="mt-1 text-xs text-slate-400">
        Core identifiers used across the RootVerse wild-capture registry.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {/* Vessel ID (immutable) */}
        <div className="md:col-span-2">
          <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
            <FiHash className="h-3 w-3" />
            Vessel ID (immutable)
          </label>

          <input
            type="text"
            name="vesselId"
            value={vesselIdValue}
            disabled
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
          />

          {mode === "create" && (
            <p className="mt-1 text-[11px] text-slate-400">
              ID will be assigned when you register the vessel.
            </p>
          )}
        </div>

        <TextField
          label="Govt registration number"
          name="govRegNo"
          value={form?.govRegNo}
          onChange={handleInputChange}
        />

        <TextField
          label="Local identifier"
          name="localId"
          value={form?.localId}
          onChange={handleInputChange}
        />

        <TextField
          label="Vessel name"
          name="name"
          value={form?.name}
          onChange={handleInputChange}
        />

        <SelectField
          label="Home port"
          name="homePort"
          value={form?.homePort}
          onChange={handleInputChange}
          options={["", "Thoothukudi", "Nagapattinam", "Mandapam", "Chennai", "Other"]}
        />

        <SelectField
          label="Vessel type"
          name="vesselType"
          value={form?.vesselType}
          onChange={handleInputChange}
          options={["", "Trawler", "Gillnetter", "Longliner", "Multi-gear"]}
        />
      </div>

      {/* Allowed methods */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-slate-600">Allowed fishing methods</p>
        <div className="flex flex-wrap gap-2">
          {allowedMethodsList.map((method) => {
            const active = (form?.allowedMethods || []).includes(method);

            return (
              <button
                key={method}
                type="button"
                onClick={() => toggleMethod(method)}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {method}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* helpers */

function TextField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
      >
        {options.map((opt) => (
          <option key={opt || "blank"} value={opt}>
            {opt || "Select…"}
          </option>
        ))}
      </select>
    </div>
  );
}
