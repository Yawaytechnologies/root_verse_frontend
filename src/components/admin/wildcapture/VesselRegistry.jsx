// src/components/admin/wildcapture/VesselRegistryManagement.jsx
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiAnchor,
  FiHash,
  FiUser,
  FiPhone,
  FiCalendar,
  FiEdit2,
} from "react-icons/fi";

const EMPTY_FORM = {
  vesselId: "", // auto / read-only
  govRegNo: "",
  localId: "",
  name: "",
  homePort: "",
  vesselType: "",
  allowedMethods: [], // array of strings
  ownerName: "",
  ownerContact: "",
  regDate: "",
  version: 1,
};

const ALLOWED_METHODS = ["Trawl", "Gillnet", "Longline", "Purse seine"];

const INITIAL_VESSELS = [
  {
    vesselId: "RV-VES-NA-000237",
    govRegNo: "TN02-72756",
    localId: "NA-69131",
    name: "Sea Pearl",
    homePort: "Tuticorin",
    vesselType: "Trawler",
    allowedMethods: ["Trawl"],
    ownerName: "Nowak Helme",
    ownerContact: "+91 90000 11111",
    regDate: "2025-02-01",
    version: 3,
    lastUpdated: "2025-12-10T08:30:00.000Z",
  },
];

export default function VesselRegistryManagement() {
  const [vessels, setVessels] = useState(INITIAL_VESSELS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [selectedId, setSelectedId] = useState(null);

  const nextVesselId = useMemo(() => {
    if (!vessels.length) return "RV-VES-NA-000001";
    const last = [...vessels].sort((a, b) =>
      a.vesselId.localeCompare(b.vesselId)
    )[vessels.length - 1];
    const num = parseInt(last.vesselId.slice(-6), 10) || 0;
    const next = (num + 1).toString().padStart(6, "0");
    return `RV-VES-NA-${next}`;
  }, [vessels]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMethod = (method) => {
    setForm((prev) => {
      const exists = prev.allowedMethods.includes(method);
      return {
        ...prev,
        allowedMethods: exists
          ? prev.allowedMethods.filter((m) => m !== method)
          : [...prev.allowedMethods, method],
      };
    });
  };

  const handleReset = () => {
    if (mode === "edit" && selectedId) {
      const vessel = vessels.find((v) => v.vesselId === selectedId);
      if (vessel) setForm(vessel);
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "create") {
      const now = new Date().toISOString();
      const newVessel = {
        ...form,
        vesselId: nextVesselId,
        version: 1,
        lastUpdated: now,
      };
      setVessels((prev) => [...prev, newVessel]);
      setForm(EMPTY_FORM);
      setSelectedId(newVessel.vesselId);
      setMode("edit");
    } else if (mode === "edit" && selectedId) {
      const now = new Date().toISOString();
      setVessels((prev) =>
        prev.map((v) =>
          v.vesselId === selectedId
            ? {
                ...v,
                ...form,
                vesselId: v.vesselId, // immutable
                version: (v.version || 1) + 1,
                lastUpdated: now,
              }
            : v
        )
      );
    }
  };

  const handleEditRow = (vessel) => {
    setSelectedId(vessel.vesselId);
    setForm(vessel);
    setMode("edit");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200"
              // hook this up to navigation if you want
              onClick={() => {}}
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Vessel Registry Management
              </h1>
              <p className="text-xs text-slate-400">
                Create, view and edit versioned vessel records.
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-5 shadow-sm"
        >
          {/* Vessel identity */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Vessel Identity
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Core identifiers used across the RootVerse registry.
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
                  value={form.vesselId || (mode === "create" ? nextVesselId : "")}
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
                value={form.govRegNo}
                onChange={handleInputChange}
              />

              <TextField
                label="Local identifier"
                name="localId"
                value={form.localId}
                onChange={handleInputChange}
              />

              <TextField
                label="Vessel name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
              />

              <SelectField
                label="Home port"
                name="homePort"
                value={form.homePort}
                onChange={handleInputChange}
                options={[
                  "",
                  "Tuticorin",
                  "Nagapattinam",
                  "Mandapam",
                  "Chennai",
                  "Other",
                ]}
              />

              <SelectField
                label="Vessel type"
                name="vesselType"
                value={form.vesselType}
                onChange={handleInputChange}
                options={["", "Trawler", "Gillnetter", "Longliner", "Multi-gear"]}
              />
            </div>

            {/* Allowed methods */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-600">
                Allowed fishing methods
              </p>
              <div className="flex flex-wrap gap-2">
                {ALLOWED_METHODS.map((method) => {
                  const active = form.allowedMethods.includes(method);
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

          {/* Owner + registration */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Owner & registration
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Who is responsible for this vessel and when it was registered.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <TextField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiUser className="h-3 w-3" />
                    Owner full name
                  </span>
                }
                name="ownerName"
                value={form.ownerName}
                onChange={handleInputChange}
              />

              <TextField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiPhone className="h-3 w-3" />
                    Owner contact
                  </span>
                }
                name="ownerContact"
                value={form.ownerContact}
                onChange={handleInputChange}
              />

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <FiCalendar className="h-3 w-3" />
                  Registration date
                </label>
                <input
                  type="date"
                  name="regDate"
                  value={form.regDate}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between sm:items-center">
            {mode === "edit" && selectedId && (
              <div className="text-[11px] text-slate-400">
                Editing vessel{" "}
                <span className="font-semibold text-slate-600">
                  {selectedId}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-xs font-medium text-white hover:bg-black"
              >
                {mode === "create" ? "Register vessel" : "Save changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Registered vessels table (compact) */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Registered vessels
            </h2>
            <p className="text-xs text-slate-400">
              {vessels.length} record{vessels.length !== 1 && "s"}
            </p>
          </div>

          {vessels.length === 0 ? (
            <p className="text-xs text-slate-400">
              No vessels registered yet. Use the form above to create one.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50/80 text-slate-500">
                  <tr>
                    <Th>Vessel ID</Th>
                    <Th>Name</Th>
                    <Th>Govt reg no</Th>
                    <Th>Home port</Th>
                    <Th>Version</Th>
                    <Th>Last updated</Th>
                    <Th className="text-right pr-3">Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {vessels.map((v) => (
                    <tr key={v.vesselId}>
                      <Td>{v.vesselId}</Td>
                      <Td>{v.name}</Td>
                      <Td>{v.govRegNo}</Td>
                      <Td>{v.homePort}</Td>
                      <Td>v{v.version || 1}</Td>
                      <Td>
                        {v.lastUpdated
                          ? new Date(v.lastUpdated).toLocaleDateString()
                          : "—"}
                      </Td>
                      <Td alignRight>
                        <button
                          type="button"
                          onClick={() => handleEditRow(v)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <FiEdit2 className="h-3 w-3" />
                          Edit
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- small presentational helpers --- */

function TextField({ label, name, value, onChange }) {
  return (
    <div>
      {typeof label === "string" ? (
        <label className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      ) : (
        <label className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <select
        name={name}
        value={value}
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

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, alignRight = false }) {
  return (
    <td
      className={`px-3 py-2 text-[11px] text-slate-700 ${
        alignRight ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
