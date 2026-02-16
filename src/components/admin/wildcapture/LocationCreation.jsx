import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDistricts,
  clearGeoStatus,
  createDistrict,
  createLocation,
  createState,
  fetchDistricts,
  fetchStates,
  selectDistricts,
  selectGeoError,
  selectGeoLoading,
  selectGeoSuccess,
  selectStates,
} from "../../../redux/reducer/locationcreationSlice";

const TABS = [
  { key: "state", label: "1) Create State" },
  { key: "district", label: "2) Create District" },
  { key: "port", label: "3) Create Port (Location)" },
];

const makeLocationCode = (name) => {
  const cleaned = (name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return (cleaned.slice(0, 2) || "LC");
};

export default function LocationCreation() {
  const dispatch = useDispatch();

  const states = useSelector(selectStates);
  const districts = useSelector(selectDistricts);

  const loading = useSelector(selectGeoLoading);
  const error = useSelector(selectGeoError);
  const success = useSelector(selectGeoSuccess);

  const [tab, setTab] = useState("state");

  // 1) State form
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");

  // 2) District form
  const [districtStateId, setDistrictStateId] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [districtCode, setDistrictCode] = useState("");

  // 3) Port form
  const [portStateId, setPortStateId] = useState("");
  const [portDistrictId, setPortDistrictId] = useState("");
  const [portName, setPortName] = useState("");
  const [locationCode, setLocationCode] = useState("");

  // All locations table
  const [allLocations, setAllLocations] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

  // Fetch all locations on mount from /api/locations
  const fetchAllLocations = async () => {
    setLocLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/locations`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      const json = await res.json();
      const data = json.data || json;
      const rows = Array.isArray(data) ? data : [];
      setAllLocations(rows);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLocLoading(false);
    }
  };

  // Fetch all districts for all states
  const fetchAllDistricts = async (statesList) => {
    try {
      for (const state of statesList) {
        dispatch(fetchDistricts({ stateId: state.id }));
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  // Once states are loaded, fetch all districts
  useEffect(() => {
    if (states.length > 0) {
      fetchAllDistricts(states);
      fetchAllLocations();
    }
  }, [states]);

  // Tab 2: fetch districts when state changes
  useEffect(() => {
    if (tab === "district" && districtStateId) {
      dispatch(fetchDistricts({ stateId: Number(districtStateId) }));
    }
  }, [dispatch, tab, districtStateId]);

  // ✅ Tab 3: fetch districts linked to selected state
  useEffect(() => {
    if (tab === "port" && portStateId) {
      dispatch(clearDistricts());
      dispatch(fetchDistricts({ stateId: Number(portStateId) }));
      setPortDistrictId("");
    }
  }, [dispatch, tab, portStateId]);



  // auto generate location code (editable)
  useEffect(() => {
    const auto = makeLocationCode(portName);
    setLocationCode(auto);
  }, [portName]);

  const districtsForPort = useMemo(() => {
    const sid = Number(portStateId);
    if (!sid) return [];

    // If API returns state_id in district objects -> filter strictly.
    // If not present -> just show whatever came from fetchDistricts.
    return districts.filter((d) => !d.state_id || Number(d.state_id) === sid);
  }, [districts, portStateId]);



  const districtsForDistrictTab = useMemo(() => {
    const sid = Number(districtStateId);
    if (!sid) return [];
    return districts.filter((d) => !d.state_id || Number(d.state_id) === sid);
  }, [districts, districtStateId]);

  const resetAlerts = () => dispatch(clearGeoStatus());

  const submitState = async (e) => {
    e.preventDefault();
    resetAlerts();

    const name = stateName.trim();
    const code = stateCode.trim().toUpperCase();

    if (!name || !code) return;

    await dispatch(createState({ name, state_code: code })).unwrap();
    setStateName("");
    setStateCode("");
    dispatch(fetchStates());
  };

  const submitDistrict = async (e) => {
    e.preventDefault();
    resetAlerts();

    const sid = Number(districtStateId);
    const name = districtName.trim();
    const code = districtCode.trim().toUpperCase();

    if (!sid || !name || !code) return;

    await dispatch(createDistrict({ name, district_code: code, state_id: sid })).unwrap();
    setDistrictName("");
    setDistrictCode("");
    dispatch(fetchDistricts({ stateId: sid }));
  };

  const submitPort = async (e) => {
    e.preventDefault();
    resetAlerts();

    const sid = Number(portStateId);
    const did = Number(portDistrictId);
    const name = portName.trim();
    const code = (locationCode || "").trim().toUpperCase();

    if (!sid || !did || !name || !code) return;

    await dispatch(
      createLocation({
        name, // Portname
        location_code: code,
        state_id: sid,
        district_id: did,
      })
    ).unwrap();

    setPortName("");
    setLocationCode("");
    setPortDistrictId("");
    // refresh all locations table
    fetchAllLocations();
  };

  // Edit / Delete handlers
  const startEdit = (loc) => {
    setEditing({ ...loc });
  };

  const saveEdit = async () => {
    if (!editing?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/locations/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          location_code: editing.location_code,
          state_id: editing.state_id,
          district_id: editing.district_id,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditing(null);
      fetchAllLocations();
    } catch (err) {
      alert(err?.message || "Update failed");
    }
  };

  const confirmDelete = async (id) => {
    if (!confirm("Delete this port?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDeletingId(null);
      fetchAllLocations();
    } catch (err) {
      setDeletingId(null);
      alert(err?.message || "Delete failed");
    }
  };

  // Helper to get state and district names from IDs
  const getStateName = (stateId) => {
    return states.find((s) => s.id === stateId)?.name || "—";
  };

  const getDistrictName = (districtId) => {
    return districts.find((d) => d.id === districtId)?.name || "—";
  };

  // Filter locations based on search input
  const filteredLocations = allLocations.filter((loc) => {
    const searchLower = searchInput.toLowerCase();
    return (
      loc.name.toLowerCase().includes(searchLower) ||
      (loc.location_code && loc.location_code.toLowerCase().includes(searchLower)) ||
      getStateName(loc.state_id).toLowerCase().includes(searchLower) ||
      getDistrictName(loc.district_id).toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIdx, endIdx);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  return (
    <div className="w-full px-2 md:px-4 py-4">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 backdrop-blur shadow-[0_12px_40px_-28px_rgba(2,6,23,0.35)]">
        {/* subtle accent bar */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500/80" />

        {/* Header (theme-matching) */}
        <div className="px-5 md:px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-emerald-50/70 via-white/60 to-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                Location Creation
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                State → District → Port (Location)
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-900/10">
                Master Data
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/20">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6">
          {/* Tabs */}
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      resetAlerts();
                      setTab(t.key);
                    }}
                    className={[
                      "px-4 py-2.5 rounded-xl text-sm font-semibold transition",
                      "ring-1 ring-slate-200 hover:ring-slate-300",
                      active
                        ? "bg-emerald-600 text-white shadow-[0_10px_22px_-14px_rgba(16,185,129,0.55)]"
                        : "bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          {(error || success) && (
            <div className="mt-4 space-y-2">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
                  <div className="font-semibold text-red-800">Error</div>
                  <div className="mt-1 text-red-700/90">{error}</div>
                </div>
              )}
              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                  <div className="font-semibold text-emerald-800">Success</div>
                  <div className="mt-1 text-emerald-700/90">{success}</div>
                </div>
              )}
            </div>
          )}

          {/* Form card */}
          <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-5 md:p-6 shadow-sm">
            {/* TAB 1 */}
            {tab === "state" && (
              <form onSubmit={submitState} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="State Name">
                    <input
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="pondycherry"
                    />
                  </Field>

                  <Field label="State Code">
                    <input
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="PY"
                    />
                  </Field>
                </div>

                <PrimaryButton
                  loading={loading}
                  disabled={loading || !stateName.trim() || !stateCode.trim()}
                  text="Submit State"
                />
              </form>
            )}

            {/* TAB 2 */}
            {tab === "district" && (
              <form onSubmit={submitDistrict} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="State">
                    <select
                      value={districtStateId}
                      onChange={(e) => setDistrictStateId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                    >
                      <option value="">Select state</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.state_code})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="District Name">
                    <input
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="mayaladurai"
                    />
                  </Field>

                  <Field label="District Code" className="md:col-span-2">
                    <input
                      value={districtCode}
                      onChange={(e) => setDistrictCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="MA"
                    />
                  </Field>
                </div>

                <PrimaryButton
                  loading={loading}
                  disabled={
                    loading ||
                    !districtStateId ||
                    !districtName.trim() ||
                    !districtCode.trim()
                  }
                  text="Submit District"
                />
              </form>
            )}

            {/* TAB 3 */}
            {tab === "port" && (
              <form onSubmit={submitPort} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="State">
                    <select
                      value={portStateId}
                      onChange={(e) => setPortStateId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                    >
                      <option value="">Select state</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.state_code})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="District">
                    <select
                      value={portDistrictId}
                      onChange={(e) => setPortDistrictId(e.target.value)}
                      disabled={!portStateId}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 disabled:opacity-60"
                    >
                      <option value="">
                        {!portStateId ? "Select state first" : "Select district"}
                      </option>
                      {districtsForPort.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.district_code})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Port Name">
                    <input
                      value={portName}
                      onChange={(e) => setPortName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="pumbukar"
                    />
                  </Field>

                  <Field label="Location Code">
                    <input
                      value={locationCode}
                      onChange={(e) => setLocationCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                      placeholder="PU"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Auto-generated from Port Name (editable).
                    </p>
                  </Field>
                </div>

                <PrimaryButton
                  loading={loading}
                  disabled={
                    loading ||
                    !portStateId ||
                    !portDistrictId ||
                    !portName.trim() ||
                    !locationCode.trim()
                  }
                  text="Submit Port (Location)"
                />
              </form>
            )}

          </div>
        </div>
      </div>
    </div>

    {/* Separate Ports Table Below Card */}
    <div className="mt-6 w-full">
      <div className="rounded-3xl border border-slate-200/80 bg-white/75 backdrop-blur shadow-[0_12px_40px_-28px_rgba(2,6,23,0.35)] overflow-hidden">
        {/* Header */}
        <div className="px-5 md:px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-emerald-50/70 via-white/60 to-white">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">
                  All Ports (Locations)
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Manage ports across all states and districts ({filteredLocations.length} results)
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAllLocations}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
              >
                Refresh
              </button>
            </div>
            <input
              type="text"
              placeholder="Search by port name, code, state, or district..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="p-4 md:p-6">
          {locLoading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading ports...</div>
          ) : filteredLocations.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              {allLocations.length === 0 ? "No ports found. Create one to get started." : "No results matching your search."}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr className="text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <th className="px-4 py-3">Port Code</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3">District</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedLocations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50 transition" title={loc.name}>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-center">{loc.location_code || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-center">{getStateName(loc.state_id)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-center">{getDistrictName(loc.district_id)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditing({...loc, viewMode: true})}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              title="View full details"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(loc)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(loc.id)}
                              disabled={deletingId === loc.id}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                            >
                              {deletingId === loc.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedLocations.map((loc) => (
                  <div key={loc.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition text-center" title={loc.name}>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-slate-500">Port Code</p>
                        <p className="text-lg font-bold text-slate-900">{loc.location_code || "—"}</p>
                        <p className="text-xs text-slate-500 mt-1">{loc.name}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-slate-200">
                        <div className="text-center">
                          <p className="text-xs font-semibold uppercase text-slate-500">State</p>
                          <p className="text-sm text-slate-900">{getStateName(loc.state_id)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold uppercase text-slate-500">District</p>
                          <p className="text-sm text-slate-900">{getDistrictName(loc.district_id)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditing({...loc, viewMode: true})}
                          className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(loc)}
                          className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(loc.id)}
                          disabled={deletingId === loc.id}
                          className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-60"
                        >
                          {deletingId === loc.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {filteredLocations.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4">
              <div className="text-sm text-slate-600">
                Showing {startIdx + 1} to {Math.min(endIdx, filteredLocations.length)} of {filteredLocations.length}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        currentPage === page
                          ? "bg-emerald-500 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Edit/View Modal */}
    {editing && (
      <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4 flex items-center justify-center">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editing.viewMode ? "Port Details" : "Edit Port"}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Port Name</label>
              <input
                type="text"
                value={editing.name || ""}
                onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                readOnly={editing.viewMode}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Location Code</label>
              <input
                type="text"
                value={editing.location_code || ""}
                onChange={(e) => setEditing((p) => ({ ...p, location_code: e.target.value }))}
                readOnly={editing.viewMode}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={getStateName(editing.state_id)}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={getDistrictName(editing.district_id)}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {editing.viewMode ? "Close" : "Cancel"}
            </button>
            {!editing.viewMode && (
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function PrimaryButton({ loading, disabled, text }) {
  return (
    <button
      disabled={disabled}
      className={[
        "w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white transition",
        "shadow-[0_12px_28px_-18px_rgba(16,185,129,0.85)]",
        "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600",
        "hover:brightness-110 active:scale-[0.99]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "focus:outline-none focus:ring-4 focus:ring-emerald-100",
      ].join(" ")}
    >
      {loading ? "Submitting..." : text}
    </button>
  );
}