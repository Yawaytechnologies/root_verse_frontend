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

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

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
  };

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
