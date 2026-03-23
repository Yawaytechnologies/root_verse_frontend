import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDistricts,
  clearGeoStatus,
  createCountry,
  createDistrict,
  createLocation,
  createState,
  fetchCountries,
  fetchDistricts,
  fetchStates,
  selectCountries,
  selectDistricts,
  selectGeoError,
  selectGeoLoading,
  selectGeoSuccess,
  selectStates,
} from "../../../redux/reducer/locationcreationSlice";

const TABS = [
  { key: "country",  label: "0) Create Country" },
  { key: "state",    label: "1) Create State" },
  { key: "district", label: "2) Create District" },
  { key: "port",     label: "3) Create Port (Location)" },
];

/* ── helpers ── */
const capFirst   = (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
const toCode     = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 2);
const makeAutoCode = (name) => (name || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 2) || "";

const EMPTY_ERRORS = {};

export default function LocationCreation() {
  const dispatch = useDispatch();

  const countries = useSelector(selectCountries);
  const states    = useSelector(selectStates);
  const districts = useSelector(selectDistricts);
  const loading   = useSelector(selectGeoLoading);
  const error     = useSelector(selectGeoError);
  const success   = useSelector(selectGeoSuccess);

  const [tab, setTab] = useState("country");
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  /* ── Country form ── */
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");

  /* ── State form ── */
  const [stateCountryId, setStateCountryId] = useState("");
  const [stateName, setStateName]           = useState("");
  const [stateCode, setStateCode]           = useState("");

  /* ── District form ── */
  const [districtCountryId, setDistrictCountryId] = useState("");
  const [districtStateId, setDistrictStateId]     = useState("");
  const [districtName, setDistrictName]           = useState("");
  const [districtCode, setDistrictCode]           = useState("");

  /* ── Port form ── */
  const [portCountryId, setPortCountryId]   = useState("");
  const [portStateId, setPortStateId]       = useState("");
  const [portDistrictId, setPortDistrictId] = useState("");
  const [portName, setPortName]             = useState("");
  const [locationCode, setLocationCode]     = useState("");

  /* ── Ports table ── */
  const [allLocations, setAllLocations] = useState([]);
  const [locLoading, setLocLoading]     = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [searchInput, setSearchInput]   = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://rootverse-backend-5qoo.onrender.com";

  const resetAlerts = () => dispatch(clearGeoStatus());
  const clearErrors = () => setErrors(EMPTY_ERRORS);

  /* ── Reset on tab change ── */
  useEffect(() => {
    resetAlerts();
    clearErrors();
    if (tab === "state") {
      setStateCountryId(""); setStateName(""); setStateCode("");
    }
    if (tab === "district") {
      setDistrictCountryId(""); setDistrictStateId("");
      setDistrictName(""); setDistrictCode("");
      dispatch(clearDistricts());
    }
    if (tab === "port") {
      setPortCountryId(""); setPortStateId("");
      setPortDistrictId(""); setPortName(""); setLocationCode("");
      dispatch(clearDistricts());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, dispatch]);

  /* ── Fetch locations table ── */
  const fetchAllLocations = async () => {
    setLocLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/locations`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const data = json.data || json;
      setAllLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLocLoading(false);
    }
  };

  /* ── Initial load ── */
  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchStates());
  }, [dispatch]);

  useEffect(() => {
    if (tab === "state" || tab === "district" || tab === "port") {
      dispatch(fetchCountries());
      dispatch(fetchStates());
    }
  }, [dispatch, tab]);

  useEffect(() => {
    if (states.length > 0) {
      // fetch districts for all states silently
      states.forEach((s) => dispatch(fetchDistricts({ stateId: s.id })));
      fetchAllLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states]);

  /* ── Auto-generate location code ── */
  useEffect(() => {
    setLocationCode(makeAutoCode(portName));
  }, [portName]);

  /* ── Filtered states by country ── */
  const statesForState = useMemo(() => {
    const cid = Number(stateCountryId);
    if (!cid) return [];
    return states.filter((s) => Number(s.country_id) === cid);
  }, [states, stateCountryId]);

  const statesForDistrict = useMemo(() => {
    const cid = Number(districtCountryId);
    if (!cid) return [];
    return states.filter((s) => Number(s.country_id) === cid);
  }, [states, districtCountryId]);

  const statesForPort = useMemo(() => {
    const cid = Number(portCountryId);
    if (!cid) return [];
    return states.filter((s) => Number(s.country_id) === cid);
  }, [states, portCountryId]);

  /* ── Districts filtered by state ── */
  const districtsForPort = useMemo(() => {
    const sid = Number(portStateId);
    if (!sid) return [];
    return districts.filter((d) => Number(d.state_id) === sid);
  }, [districts, portStateId]);

  const districtsForDistrict = useMemo(() => {
    const sid = Number(districtStateId);
    if (!sid) return [];
    return districts.filter((d) => Number(d.state_id) === sid);
  }, [districts, districtStateId]);

  /* ── Fetch districts on state change ── */
  useEffect(() => {
    if (tab === "district" && districtStateId) {
      dispatch(fetchDistricts({ stateId: Number(districtStateId) }));
    }
  }, [dispatch, tab, districtStateId]);

  useEffect(() => {
    if (tab === "port" && portStateId) {
      dispatch(clearDistricts());
      dispatch(fetchDistricts({ stateId: Number(portStateId) }));
      setPortDistrictId("");
    }
  }, [dispatch, tab, portStateId]);

  /* ── Validations ── */
  const validateCountry = () => {
    const e = {};
    if (!countryName.trim()) e.countryName = "Country name is required";
    if (!countryCode.trim()) e.countryCode = "Country code is required";
    else if (countryCode.trim().length < 2) e.countryCode = "Code must be at least 2 characters";
    return e;
  };

  const validateState = () => {
    const e = {};
    if (!stateCountryId) e.stateCountryId = "Select a country";
    if (!stateName.trim()) e.stateName = "State name is required";
    if (!stateCode.trim()) e.stateCode = "State code is required";
    else if (stateCode.trim().length < 2) e.stateCode = "Code must be at least 2 characters";
    return e;
  };

  const validateDistrict = () => {
    const e = {};
    if (!districtCountryId) e.districtCountryId = "Select a country";
    if (!districtStateId) e.districtStateId = "Select a state";
    if (!districtName.trim()) e.districtName = "District name is required";
    if (!districtCode.trim()) e.districtCode = "District code is required";
    else if (districtCode.trim().length < 2) e.districtCode = "Code must be at least 2 characters";
    return e;
  };

  const validatePort = () => {
    const e = {};
    if (!portCountryId)  e.portCountryId  = "Select a country";
    if (!portStateId)    e.portStateId    = "Select a state";
    if (!portDistrictId) e.portDistrictId = "Select a district";
    if (!portName.trim()) e.portName = "Port name is required";
    if (!locationCode.trim()) e.locationCode = "Location code is required";
    else if (locationCode.trim().length < 2) e.locationCode = "Code must be at least 2 characters";
    return e;
  };

  /* ── Submit handlers ── */
  const submitCountry = async (e) => {
    e.preventDefault();
    clearErrors();
    const errs = validateCountry();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    resetAlerts();
    await dispatch(createCountry({ name: countryName.trim(), code: countryCode.trim().toUpperCase() })).unwrap();
    setCountryName(""); setCountryCode("");
    await dispatch(fetchCountries()).unwrap();
  };

  const submitState = async (e) => {
    e.preventDefault();
    clearErrors();
    const errs = validateState();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    resetAlerts();
    await dispatch(createState({ name: stateName.trim(), state_code: stateCode.trim().toUpperCase(), country_id: Number(stateCountryId) })).unwrap();
    setStateName(""); setStateCode(""); setStateCountryId("");
    await dispatch(fetchStates()).unwrap();
  };

  const submitDistrict = async (e) => {
    e.preventDefault();
    clearErrors();
    const errs = validateDistrict();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    resetAlerts();
    const sid = Number(districtStateId);
    await dispatch(createDistrict({ name: districtName.trim(), district_code: districtCode.trim().toUpperCase(), state_id: sid })).unwrap();
    setDistrictName(""); setDistrictCode(""); setDistrictCountryId(""); setDistrictStateId("");
    await dispatch(fetchDistricts({ stateId: sid })).unwrap();
    dispatch(clearDistricts());
  };

  const submitPort = async (e) => {
    e.preventDefault();
    clearErrors();
    const errs = validatePort();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    resetAlerts();
    await dispatch(createLocation({
      name: portName.trim(),
      location_code: locationCode.trim().toUpperCase(),
      state_id: Number(portStateId),
      district_id: Number(portDistrictId),
    })).unwrap();
    setPortName(""); setLocationCode(""); setPortCountryId("");
    setPortStateId(""); setPortDistrictId("");
    dispatch(clearDistricts());
    fetchAllLocations();
  };

  /* ── Edit / Delete ── */
  const saveEdit = async () => {
    if (!editing?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/locations/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editing.name, location_code: editing.location_code, state_id: editing.state_id, district_id: editing.district_id }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditing(null);
      fetchAllLocations();
    } catch (err) { alert(err?.message || "Update failed"); }
  };

  const confirmDelete = async (id) => {
    if (!confirm("Delete this port?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDeletingId(null);
      fetchAllLocations();
    } catch (err) { setDeletingId(null); alert(err?.message || "Delete failed"); }
  };

  /* ── Table helpers ── */
  const getStateName    = (id) => states.find((s) => s.id === id)?.name || "—";
  const getDistrictName = (id) => districts.find((d) => d.id === id)?.name || "—";
  const getCountryNameFromStateId = (stateId) => {
    const st = states.find((s) => Number(s.id) === Number(stateId));
    if (!st?.country_id) return "—";
    const c = countries.find((cc) => Number(cc.id) === Number(st.country_id));
    if (!c) return "—";
    const code = c.code ?? c.country_code ?? "";
    return code ? `${c.name} (${code})` : c.name;
  };

  const filteredLocations = allLocations.filter((loc) => {
    const q = searchInput.toLowerCase();
    return (
      (loc.name || "").toLowerCase().includes(q) ||
      (loc.location_code || "").toLowerCase().includes(q) ||
      getStateName(loc.state_id).toLowerCase().includes(q) ||
      getDistrictName(loc.district_id).toLowerCase().includes(q)
    );
  });

  const totalPages        = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIdx          = (currentPage - 1) * itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => setCurrentPage(1), [searchInput]);

  /* ── Shared input classes ── */
  const inputCls = (err) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-4 ${
      err
        ? "border-rose-400 bg-rose-50 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 bg-white focus:border-emerald-300 focus:ring-emerald-100"
    }`;

  return (
    <div className="w-full px-2 md:px-4 py-4">
      <div className="w-full">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 backdrop-blur shadow-[0_12px_40px_-28px_rgba(2,6,23,0.35)]">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500/80" />

          <div className="px-5 md:px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-emerald-50/70 via-white/60 to-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Location Creation</h2>
                <p className="mt-1 text-sm text-slate-600">Country → State → District → Port (Location)</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-900/10">Master Data</span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/20">Admin</span>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Tabs */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button key={t.key} type="button"
                      onClick={() => { resetAlerts(); clearErrors(); setTab(t.key); }}
                      className={[
                        "px-4 py-2.5 rounded-xl text-sm font-semibold transition ring-1 ring-slate-200 hover:ring-slate-300",
                        active ? "bg-emerald-600 text-white shadow-[0_10px_22px_-14px_rgba(16,185,129,0.55)]" : "bg-white text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >{t.label}</button>
                  );
                })}
              </div>
            </div>

            {/* Alerts */}
            {(error || success) && (
              <div className="mt-4 space-y-2">
                {error   && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm"><div className="font-semibold text-red-800">Error</div><div className="mt-1 text-red-700/90">{error}</div></div>}
                {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm"><div className="font-semibold text-emerald-800">Success</div><div className="mt-1 text-emerald-700/90">{success}</div></div>}
              </div>
            )}

            {/* Form card */}
            <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-5 md:p-6 shadow-sm">

              {/* ── TAB 0: COUNTRY ── */}
              {tab === "country" && (
                <form onSubmit={submitCountry} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Country Name" error={errors.countryName}>
                      <input
                        value={countryName}
                        onChange={(e) => { setCountryName(capFirst(e.target.value)); if (errors.countryName) setErrors(p => ({ ...p, countryName: "" })); }}
                        className={inputCls(errors.countryName)}
                        placeholder="India"
                      />
                    </Field>
                    <Field label="Country Code" error={errors.countryCode} hint="Max 2 characters">
                      <input
                        value={countryCode}
                        onChange={(e) => { setCountryCode(toCode(e.target.value)); if (errors.countryCode) setErrors(p => ({ ...p, countryCode: "" })); }}
                        maxLength={2}
                        className={inputCls(errors.countryCode)}
                        placeholder="IN"
                      />
                    </Field>
                  </div>
                  <PrimaryButton loading={loading} text="Submit Country" />
                </form>
              )}

              {/* ── TAB 1: STATE ── */}
              {tab === "state" && (
                <form onSubmit={submitState} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Country" error={errors.stateCountryId}>
                      <select
                        value={stateCountryId}
                        onChange={(e) => { setStateCountryId(e.target.value); if (errors.stateCountryId) setErrors(p => ({ ...p, stateCountryId: "" })); }}
                        className={inputCls(errors.stateCountryId)}
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code ?? c.country_code ?? ""})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="State Name" error={errors.stateName}>
                      <input
                        value={stateName}
                        onChange={(e) => { setStateName(capFirst(e.target.value)); if (errors.stateName) setErrors(p => ({ ...p, stateName: "" })); }}
                        className={inputCls(errors.stateName)}
                        placeholder="Tamil Nadu"
                      />
                    </Field>
                    <Field label="State Code" error={errors.stateCode} hint="Max 2 characters">
                      <input
                        value={stateCode}
                        onChange={(e) => { setStateCode(toCode(e.target.value)); if (errors.stateCode) setErrors(p => ({ ...p, stateCode: "" })); }}
                        maxLength={2}
                        className={inputCls(errors.stateCode)}
                        placeholder="TN"
                      />
                    </Field>
                  </div>
                  <PrimaryButton loading={loading} text="Submit State" />
                </form>
              )}

              {/* ── TAB 2: DISTRICT ── */}
              {tab === "district" && (
                <form onSubmit={submitDistrict} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Country" error={errors.districtCountryId}>
                      <select
                        value={districtCountryId}
                        onChange={(e) => {
                          setDistrictCountryId(e.target.value);
                          setDistrictStateId("");
                          dispatch(clearDistricts());
                          if (errors.districtCountryId) setErrors(p => ({ ...p, districtCountryId: "" }));
                        }}
                        className={inputCls(errors.districtCountryId)}
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code ?? c.country_code ?? ""})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="State" error={errors.districtStateId}>
                      <select
                        value={districtStateId}
                        onChange={(e) => { setDistrictStateId(e.target.value); if (errors.districtStateId) setErrors(p => ({ ...p, districtStateId: "" })); }}
                        disabled={!districtCountryId}
                        className={inputCls(errors.districtStateId) + " disabled:opacity-60 disabled:cursor-not-allowed"}
                      >
                        <option value="">{!districtCountryId ? "Select country first" : "Select state"}</option>
                        {statesForDistrict.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.state_code ?? s.code ?? ""})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="District Name" error={errors.districtName}>
                      <input
                        value={districtName}
                        onChange={(e) => { setDistrictName(capFirst(e.target.value)); if (errors.districtName) setErrors(p => ({ ...p, districtName: "" })); }}
                        className={inputCls(errors.districtName)}
                        placeholder="Kanyakumari"
                      />
                    </Field>
                    <Field label="District Code" error={errors.districtCode} hint="Max 2 characters">
                      <input
                        value={districtCode}
                        onChange={(e) => { setDistrictCode(toCode(e.target.value)); if (errors.districtCode) setErrors(p => ({ ...p, districtCode: "" })); }}
                        maxLength={2}
                        className={inputCls(errors.districtCode)}
                        placeholder="KK"
                      />
                    </Field>
                  </div>
                  <PrimaryButton loading={loading} text="Submit District" />
                </form>
              )}

              {/* ── TAB 3: PORT ── */}
              {tab === "port" && (
                <form onSubmit={submitPort} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Country" error={errors.portCountryId}>
                      <select
                        value={portCountryId}
                        onChange={(e) => {
                          setPortCountryId(e.target.value);
                          setPortStateId(""); setPortDistrictId("");
                          dispatch(clearDistricts());
                          if (errors.portCountryId) setErrors(p => ({ ...p, portCountryId: "" }));
                        }}
                        className={inputCls(errors.portCountryId)}
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code ?? c.country_code ?? ""})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="State" error={errors.portStateId}>
                      <select
                        value={portStateId}
                        onChange={(e) => { setPortStateId(e.target.value); if (errors.portStateId) setErrors(p => ({ ...p, portStateId: "" })); }}
                        disabled={!portCountryId}
                        className={inputCls(errors.portStateId) + " disabled:opacity-60 disabled:cursor-not-allowed"}
                      >
                        <option value="">{!portCountryId ? "Select country first" : "Select state"}</option>
                        {statesForPort.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.state_code ?? s.code ?? ""})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="District" error={errors.portDistrictId}>
                      <select
                        value={portDistrictId}
                        onChange={(e) => { setPortDistrictId(e.target.value); if (errors.portDistrictId) setErrors(p => ({ ...p, portDistrictId: "" })); }}
                        disabled={!portStateId}
                        className={inputCls(errors.portDistrictId) + " disabled:opacity-60 disabled:cursor-not-allowed"}
                      >
                        <option value="">{!portStateId ? "Select state first" : "Select district"}</option>
                        {districtsForPort.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.district_code ?? d.code ?? ""})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Port Name" error={errors.portName}>
                      <input
                        value={portName}
                        onChange={(e) => { setPortName(capFirst(e.target.value)); if (errors.portName) setErrors(p => ({ ...p, portName: "" })); }}
                        className={inputCls(errors.portName)}
                        placeholder="Poompuhar"
                      />
                    </Field>
                    <Field label="Location Code" error={errors.locationCode} hint="Auto-generated · Max 2 characters · Editable">
                      <input
                        value={locationCode}
                        onChange={(e) => { setLocationCode(toCode(e.target.value)); if (errors.locationCode) setErrors(p => ({ ...p, locationCode: "" })); }}
                        maxLength={2}
                        className={inputCls(errors.locationCode)}
                        placeholder="PO"
                      />
                    </Field>
                  </div>
                  <PrimaryButton loading={loading} text="Submit Port (Location)" />
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ports Table ── */}
      <div className="mt-6 w-full">
        <div className="rounded-3xl border border-slate-200/80 bg-white/75 backdrop-blur shadow-[0_12px_40px_-28px_rgba(2,6,23,0.35)] overflow-hidden">
          <div className="px-5 md:px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-emerald-50/70 via-white/60 to-white">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900">All Ports (Locations)</h3>
                  <p className="mt-1 text-sm text-slate-600">Manage ports across all states and districts ({filteredLocations.length} results)</p>
                </div>
                <button type="button" onClick={fetchAllLocations} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">Refresh</button>
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

          <div className="p-4 md:p-6">
            {locLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading ports...</div>
            ) : filteredLocations.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                {allLocations.length === 0 ? "No ports found. Create one to get started." : "No results matching your search."}
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr className="text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        <th className="px-4 py-3">Port Name</th>
                        <th className="px-4 py-3">Port Code</th>
                        <th className="px-4 py-3">State</th>
                        <th className="px-4 py-3">District</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginatedLocations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 text-sm font-medium text-slate-800 text-center">{loc.name || "—"}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-center">{loc.location_code || "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-center">{getStateName(loc.state_id)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 text-center">{getDistrictName(loc.district_id)}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1">
                              <button type="button" onClick={() => setEditing({ ...loc, viewMode: true })} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">View</button>
                              <button type="button" onClick={() => setEditing({ ...loc })} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Edit</button>
                              <button type="button" onClick={() => confirmDelete(loc.id)} disabled={deletingId === loc.id} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
                                {deletingId === loc.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-3">
                  {paginatedLocations.map((loc) => (
                    <div key={loc.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-900">{loc.location_code || "—"}</p>
                          <p className="text-sm text-slate-700 mt-0.5">{loc.name}</p>
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
                          <button type="button" onClick={() => setEditing({ ...loc, viewMode: true })} className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">View</button>
                          <button type="button" onClick={() => setEditing({ ...loc })} className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Edit</button>
                          <button type="button" onClick={() => confirmDelete(loc.id)} disabled={deletingId === loc.id} className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
                            {deletingId === loc.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {filteredLocations.length > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-600">
                  Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredLocations.length)} of {filteredLocations.length}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} type="button" onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${currentPage === page ? "bg-emerald-500 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit / View Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4 flex items-center justify-center">
          <div className="mx-auto max-w-lg w-full rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{editing.viewMode ? "Port Details" : "Edit Port"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Port Name", key: "name", readOnly: !!editing.viewMode, transform: capFirst },
                { label: "Location Code", key: "location_code", readOnly: !!editing.viewMode, transform: toCode, maxLength: 3 },
              ].map(({ label, key, readOnly, transform, maxLength }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={editing[key] || ""}
                    onChange={(e) => !readOnly && setEditing((p) => ({ ...p, [key]: transform ? transform(e.target.value) : e.target.value }))}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 read-only:bg-slate-50 read-only:text-slate-600"
                  />
                </div>
              ))}
              {[
                { label: "Country", value: getCountryNameFromStateId(editing.state_id) },
                { label: "State",   value: getStateName(editing.state_id) },
                { label: "District", value: getDistrictName(editing.district_id) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
                  <input type="text" value={value} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {editing.viewMode ? "Close" : "Cancel"}
              </button>
              {!editing.viewMode && (
                <button type="button" onClick={saveEdit} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Save</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, error, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      {children}
      {hint  && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function PrimaryButton({ loading, text }) {
  return (
    <button
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