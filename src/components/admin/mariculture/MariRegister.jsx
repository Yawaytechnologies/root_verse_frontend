// src/components/admin/mariculture/MariUnitRegistryManagement.jsx
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiHash,
  FiMapPin,
  FiCompass,
  FiWind,
  FiDroplet,
  FiUser,
  FiPhone,
  FiCalendar,
  FiEdit2,
} from "react-icons/fi";

const EMPTY_FORM = {
  unitId: "",
  siteCode: "",
  siteName: "",
  unitCode: "",
  location: "",
  gridRef: "",
  distanceFromShoreKm: "",
  depthM: "",
  structureType: "",
  species: [],
  licenseNo: "",
  licenseValidTill: "",
  ownerName: "",
  ownerContact: "",
  version: 1,
};

const SPECIES_OPTIONS = [
  "Seabass",
  "Cobia",
  "Pompano",
  "Mussel",
  "Oyster",
  "Seaweed",
];

const INITIAL_UNITS = [
  {
    unitId: "MC-UNIT-NA-000045",
    siteCode: "MC-SITE-001",
    siteName: "Coral Bay",
    unitCode: "CAGE-01",
    location: "Off Tuticorin · 3.2 km",
    gridRef: "8.7890 N, 78.1234 E",
    distanceFromShoreKm: "3.2",
    depthM: "18",
    structureType: "Cage",
    species: ["Seabass"],
    licenseNo: "TN-MC-2025-001",
    licenseValidTill: "2027-12-31",
    ownerName: "Nowak Helme",
    ownerContact: "+91 90000 11111",
    version: 2,
    lastUpdated: "2025-12-10T09:45:00.000Z",
  },
];

export default function MariUnitRegistryManagement() {
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState("create"); // create | edit
  const [selectedId, setSelectedId] = useState(null);

  const nextUnitId = useMemo(() => {
    if (!units.length) return "MC-UNIT-NA-000001";
    const last = [...units].sort((a, b) =>
      a.unitId.localeCompare(b.unitId)
    )[units.length - 1];
    const num = parseInt(last.unitId.slice(-6), 10) || 0;
    const next = (num + 1).toString().padStart(6, "0");
    return `MC-UNIT-NA-${next}`;
  }, [units]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSpecies = (sp) => {
    setForm((prev) => {
      const exists = prev.species.includes(sp);
      return {
        ...prev,
        species: exists
          ? prev.species.filter((s) => s !== sp)
          : [...prev.species, sp],
      };
    });
  };

  const handleReset = () => {
    if (mode === "edit" && selectedId) {
      const unit = units.find((u) => u.unitId === selectedId);
      if (unit) setForm(unit);
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "create") {
      const now = new Date().toISOString();
      const newUnit = {
        ...form,
        unitId: nextUnitId,
        version: 1,
        lastUpdated: now,
      };
      setUnits((prev) => [...prev, newUnit]);
      setForm(EMPTY_FORM);
      setSelectedId(newUnit.unitId);
      setMode("edit");
    } else if (mode === "edit" && selectedId) {
      const now = new Date().toISOString();
      setUnits((prev) =>
        prev.map((u) =>
          u.unitId === selectedId
            ? {
                ...u,
                ...form,
                unitId: u.unitId,
                version: (u.version || 1) + 1,
                lastUpdated: now,
              }
            : u
        )
      );
    }
  };

  const handleEditRow = (unit) => {
    setSelectedId(unit.unitId);
    setForm(unit);
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
              onClick={() => {}}
            >
              <FiArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Mariculture Unit Registry
              </h1>
              <p className="text-xs text-slate-400">
                Create, view and edit versioned cage / longline records.
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-5 shadow-sm"
        >
          {/* Site & unit identity */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Site & unit identity
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Core identifiers used for offshore mariculture traceability.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {/* Unit ID immutable */}
              <div className="md:col-span-2">
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <FiHash className="h-3 w-3" />
                  Unit ID (immutable)
                </label>
                <input
                  type="text"
                  name="unitId"
                  value={form.unitId || (mode === "create" ? nextUnitId : "")}
                  disabled
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                {mode === "create" && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    ID will be assigned when you register the unit.
                  </p>
                )}
              </div>

              <TextField
                label="Site code (e.g. MC-SITE-001)"
                name="siteCode"
                value={form.siteCode}
                onChange={handleInputChange}
              />

              <TextField
                label="Site name"
                name="siteName"
                value={form.siteName}
                onChange={handleInputChange}
              />

              <TextField
                label="Unit code (e.g. CAGE-01 / LINE-A1)"
                name="unitCode"
                value={form.unitCode}
                onChange={handleInputChange}
              />

              <TextField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiMapPin className="h-3 w-3" />
                    Location (coast / village)
                  </span>
                }
                name="location"
                value={form.location}
                onChange={handleInputChange}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <TextField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiCompass className="h-3 w-3" />
                    Grid / GPS reference
                  </span>
                }
                name="gridRef"
                value={form.gridRef}
                onChange={handleInputChange}
              />

              <TextField
                label="Distance from shore (km)"
                name="distanceFromShoreKm"
                value={form.distanceFromShoreKm}
                onChange={handleInputChange}
              />

              <TextField
                label="Water depth (m)"
                name="depthM"
                value={form.depthM}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Structure & species */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Structure & species
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              What structure is moored and what species are stocked.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SelectField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiWind className="h-3 w-3" />
                    Structure type
                  </span>
                }
                name="structureType"
                value={form.structureType}
                onChange={handleInputChange}
                options={["", "Cage", "Longline", "Raft", "Other"]}
              />

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <FiDroplet className="h-3 w-3" />
                  Culture species
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIES_OPTIONS.map((sp) => {
                    const active = form.species.includes(sp);
                    return (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => toggleSpecies(sp)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {sp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* License & owner */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              License & responsible contact
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Regulatory permit and who is responsible for this site.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <TextField
                label="License / permission number"
                name="licenseNo"
                value={form.licenseNo}
                onChange={handleInputChange}
              />

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <FiCalendar className="h-3 w-3" />
                  License valid till
                </label>
                <input
                  type="date"
                  name="licenseValidTill"
                  value={form.licenseValidTill}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>

              <TextField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiUser className="h-3 w-3" />
                    Owner / manager name
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
                    Contact number
                  </span>
                }
                name="ownerContact"
                value={form.ownerContact}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {mode === "edit" && selectedId && (
              <div className="text-[11px] text-slate-400">
                Editing unit{" "}
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
                {mode === "create" ? "Register unit" : "Save changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Registered units table */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Registered units
            </h2>
            <p className="text-xs text-slate-400">
              {units.length} record{units.length !== 1 && "s"}
            </p>
          </div>

          {units.length === 0 ? (
            <p className="text-xs text-slate-400">
              No mariculture units registered yet. Use the form above to create
              one.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50/80 text-slate-500">
                  <tr>
                    <Th>Unit ID</Th>
                    <Th>Site</Th>
                    <Th>Unit code</Th>
                    <Th>Structure</Th>
                    <Th>Species</Th>
                    <Th>Version</Th>
                    <Th>Last updated</Th>
                    <Th className="text-right pr-3">Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {units.map((u) => (
                    <tr key={u.unitId}>
                      <Td>{u.unitId}</Td>
                      <Td>
                        {u.siteCode} · {u.siteName}
                      </Td>
                      <Td>{u.unitCode}</Td>
                      <Td>{u.structureType || "—"}</Td>
                      <Td>{u.species.join(", ") || "—"}</Td>
                      <Td>v{u.version || 1}</Td>
                      <Td>
                        {u.lastUpdated
                          ? new Date(u.lastUpdated).toLocaleDateString()
                          : "—"}
                      </Td>
                      <Td alignRight>
                        <button
                          type="button"
                          onClick={() => handleEditRow(u)}
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

/* helpers */

function TextField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
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
