// src/components/admin/aquaculture/PondRegistryManagement.jsx
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiLayers,
  FiHash,
  FiMapPin,
  FiUser,
  FiPhone,
  FiCalendar,
  FiDroplet,
  FiEdit2,
} from "react-icons/fi";

const EMPTY_FORM = {
  pondId: "",
  farmCode: "",
  farmName: "",
  pondCode: "",
  location: "",
  species: [],
  cultureSystem: "",
  waterSource: "",
  areaHa: "",
  stockingDate: "",
  stockingDensity: "",
  ownerName: "",
  ownerContact: "",
  version: 1,
};

const SPECIES_OPTIONS = ["Shrimp", "Tilapia", "Seabass", "Carp", "Other"];

const INITIAL_PONDS = [
  {
    pondId: "AQ-POND-NA-000123",
    farmCode: "NA-FRM-001",
    farmName: "Blue Creek Aquafarm",
    pondCode: "P01",
    location: "Nagapattinam",
    species: ["Shrimp"],
    cultureSystem: "Earthen pond",
    waterSource: "Borewell + canal",
    areaHa: "0.8",
    stockingDate: "2025-01-15",
    stockingDensity: "120 PL/m²",
    ownerName: "Nowak Helme",
    ownerContact: "+91 90000 11111",
    version: 2,
    lastUpdated: "2025-12-10T09:10:00.000Z",
  },
];

export default function PondRegistryManagement() {
  const [ponds, setPonds] = useState(INITIAL_PONDS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mode, setMode] = useState("create"); // create | edit
  const [selectedId, setSelectedId] = useState(null);

  const nextPondId = useMemo(() => {
    if (!ponds.length) return "AQ-POND-NA-000001";
    const last = [...ponds].sort((a, b) =>
      a.pondId.localeCompare(b.pondId)
    )[ponds.length - 1];
    const num = parseInt(last.pondId.slice(-6), 10) || 0;
    const next = (num + 1).toString().padStart(6, "0");
    return `AQ-POND-NA-${next}`;
  }, [ponds]);

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
      const pond = ponds.find((p) => p.pondId === selectedId);
      if (pond) setForm(pond);
    } else {
      setForm(EMPTY_FORM);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "create") {
      const now = new Date().toISOString();
      const newPond = {
        ...form,
        pondId: nextPondId,
        version: 1,
        lastUpdated: now,
      };
      setPonds((prev) => [...prev, newPond]);
      setForm(EMPTY_FORM);
      setSelectedId(newPond.pondId);
      setMode("edit");
    } else if (mode === "edit" && selectedId) {
      const now = new Date().toISOString();
      setPonds((prev) =>
        prev.map((p) =>
          p.pondId === selectedId
            ? {
                ...p,
                ...form,
                pondId: p.pondId,
                version: (p.version || 1) + 1,
                lastUpdated: now,
              }
            : p
        )
      );
    }
  };

  const handleEditRow = (pond) => {
    setSelectedId(pond.pondId);
    setForm(pond);
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
                Pond Registry Management
              </h1>
              <p className="text-xs text-slate-400">
                Create, view and edit versioned pond records inside farms.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-5 shadow-sm"
        >
          {/* Farm & pond identity */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Farm & pond identity
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Identifiers used for traceability across the aquaculture module.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {/* Pond ID (immutable) */}
              <div className="md:col-span-2">
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <FiHash className="h-3 w-3" />
                  Pond ID (immutable)
                </label>
                <input
                  type="text"
                  name="pondId"
                  value={form.pondId || (mode === "create" ? nextPondId : "")}
                  disabled
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                />
                {mode === "create" && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    ID will be assigned when you register the pond.
                  </p>
                )}
              </div>

              <TextField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiLayers className="h-3 w-3" />
                    Farm code
                  </span>
                }
                name="farmCode"
                value={form.farmCode}
                onChange={handleInputChange}
              />

              <TextField
                label="Farm name"
                name="farmName"
                value={form.farmName}
                onChange={handleInputChange}
              />

              <TextField
                label="Pond code / name"
                name="pondCode"
                value={form.pondCode}
                onChange={handleInputChange}
              />

              <TextField
                label={
                  <span className="inline-flex items-center gap-1">
                    <FiMapPin className="h-3 w-3" />
                    Location (village / district)
                  </span>
                }
                name="location"
                value={form.location}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Species & system */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Species & culture system
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              What is stocked and how the pond is operated.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SelectField
                label="Culture system"
                name="cultureSystem"
                value={form.cultureSystem}
                onChange={handleInputChange}
                options={[
                  "",
                  "Earthen pond",
                  "HDPE-lined pond",
                  "Tank / RAS",
                  "Cage / pen",
                ]}
              />

              <SelectField
                label="Water source"
                name="waterSource"
                value={form.waterSource}
                onChange={handleInputChange}
                options={[
                  "",
                  "Borewell",
                  "Canal",
                  "Reservoir",
                  "Sea water intake",
                  "Mixed",
                ]}
              />

              <TextField
                label="Pond area (ha)"
                name="areaHa"
                value={form.areaHa}
                onChange={handleInputChange}
              />

              <TextField
                label="Stocking density (e.g. 120 PL/m²)"
                name="stockingDensity"
                value={form.stockingDensity}
                onChange={handleInputChange}
              />

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
                  <FiCalendar className="h-3 w-3" />
                  Stocking date
                </label>
                <input
                  type="date"
                  name="stockingDate"
                  value={form.stockingDate}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                />
              </div>
            </div>

            {/* Species chips */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-600 flex items-center gap-1">
                <FiDroplet className="h-3 w-3" />
                Culture species
              </p>
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

          {/* Owner contact */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Responsible contact
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Who manages this farm / pond for traceability and audits.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                Editing pond{" "}
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
                {mode === "create" ? "Register pond" : "Save changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Registered ponds table */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Registered ponds
            </h2>
            <p className="text-xs text-slate-400">
              {ponds.length} record{ponds.length !== 1 && "s"}
            </p>
          </div>

          {ponds.length === 0 ? (
            <p className="text-xs text-slate-400">
              No ponds registered yet. Use the form above to create one.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50/80 text-slate-500">
                  <tr>
                    <Th>Pond ID</Th>
                    <Th>Farm</Th>
                    <Th>Pond code</Th>
                    <Th>Species</Th>
                    <Th>Area (ha)</Th>
                    <Th>Version</Th>
                    <Th>Last updated</Th>
                    <Th className="text-right pr-3">Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {ponds.map((p) => (
                    <tr key={p.pondId}>
                      <Td>{p.pondId}</Td>
                      <Td>
                        {p.farmCode} · {p.farmName}
                      </Td>
                      <Td>{p.pondCode}</Td>
                      <Td>{p.species.join(", ") || "—"}</Td>
                      <Td>{p.areaHa || "—"}</Td>
                      <Td>v{p.version || 1}</Td>
                      <Td>
                        {p.lastUpdated
                          ? new Date(p.lastUpdated).toLocaleDateString()
                          : "—"}
                      </Td>
                      <Td alignRight>
                        <button
                          type="button"
                          onClick={() => handleEditRow(p)}
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
