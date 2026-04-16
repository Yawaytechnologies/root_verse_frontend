// QualityController.jsx — Create Quality Checker (PCC Admin)
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiRefreshCcw, FiSave, FiAlertTriangle,
  FiUserCheck, FiChevronDown,
} from "react-icons/fi";
import { MdOutlineVerifiedUser } from "react-icons/md";
import {
  fetchQualityCheckers,
  createQualityCheckerThunk,
  fetchStatesThunk,
  fetchDistrictsByStateThunk,
  fetchLocationsByStateThunk,
} from "../../../redux/action/qualitycheckerActions";
import { clearDistrictsAndLocations } from "../../../redux/reducer/qualitycheckerSlice";

const A = "#D97706";

const EMPTY = {
  checker_name: "",
  checker_email: "",
  checker_phone: "",
  state_id: "",
  district_id: "",
  location_id: "",
  is_active: true,
};

/* ── Shared atoms ── */
function Field({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label}{required && <span style={{ color: A }}> *</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-xl bg-stone-50 px-4 text-sm font-medium text-stone-900 ring-1 ring-stone-200 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition"
        style={{ "--tw-ring-color": A }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, loading, error, required, disabled }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">
        {label}{required && <span style={{ color: A }}> *</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-10 rounded-xl bg-stone-50 px-4 pr-9 text-sm font-medium text-stone-900 ring-1 ring-stone-200 appearance-none focus:bg-white focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ "--tw-ring-color": A }}
        >
          <option value="">{loading ? "Loading…" : disabled ? "Select State first…" : `Select ${label}…`}</option>
          {(Array.isArray(options) ? options : []).filter(o => o?.value).map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      </div>
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

function StatusToggle({ checked, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-stone-700 uppercase tracking-widest">Status</p>
        <p className="text-xs text-stone-500 mt-0.5">Default is Active</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className="relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none"
        style={{ background: checked ? A : "#D6D3D1" }}
      >
        <span
          className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

/* ── Main ── */
export default function QualityChecker() {
  const dispatch = useDispatch();
  const {
    list = [], loading, error, creating,
    states = [], statesLoading, statesError,
    districts = [], districtsLoading, districtsError,
    locations = [], locationsLoading, locationsError,
  } = useSelector((s) => s.qualityChecker);

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    dispatch(fetchQualityCheckers());
    dispatch(fetchStatesThunk());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);
  const stats = useMemo(() => ({
    total:  rows.length,
    active: rows.filter(x => x?.is_active === true).length,
  }), [rows]);

  const stateOptions    = useMemo(() => (Array.isArray(states)    ? states    : []).map(s => ({ value: String(s?.id ?? s?.state_id),    label: s?.state_name    ?? s?.name ?? `#${s?.id}` })), [states]);
  const districtOptions = useMemo(() => (Array.isArray(districts) ? districts : []).map(d => ({ value: String(d?.id ?? d?.district_id), label: d?.district_name ?? d?.name ?? `#${d?.id}` })), [districts]);
  const locationOptions = useMemo(() => (Array.isArray(locations) ? locations : []).map(l => ({ value: String(l?.id ?? l?.location_id), label: l?.location_name ?? l?.name ?? `#${l?.id}` })), [locations]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleStateChange = (v) => {
    setField("state_id", v);
    setField("district_id", "");
    setField("location_id", "");
    if (v) {
      dispatch(fetchDistrictsByStateThunk(v));
      dispatch(fetchLocationsByStateThunk(v));
    } else {
      dispatch(clearDistrictsAndLocations());
    }
  };

  const validate = (f) => {
    if (!f.checker_name.trim())  return "Checker name required";
    if (!f.checker_email.trim()) return "Checker email required";
    if (!/^\S+@\S+\.\S+$/.test(f.checker_email.trim())) return "Invalid email";
    if (!f.checker_phone.trim()) return "Phone required";
    if (!/^\d{7,15}$/.test(f.checker_phone.trim())) return "Phone must be digits (7–15)";
    if (!f.state_id)    return "State is required";
    if (!f.district_id) return "District is required";
    if (!f.location_id) return "Location is required";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) return alert(err);
    await dispatch(createQualityCheckerThunk({
      checker_name:  form.checker_name.trim(),
      checker_email: form.checker_email.trim(),
      checker_phone: form.checker_phone.trim(),
      state_id:      Number(form.state_id),
      district_id:   Number(form.district_id),
      location_id:   Number(form.location_id),
      is_active:     !!form.is_active,
    }));
    dispatch(fetchQualityCheckers());
    setForm(EMPTY);
    dispatch(clearDistrictsAndLocations());
  };

  return (
    <div className="pccQC min-h-full" style={{ background: "#F7F5F2" }}>
      <style>{`.pccQC * { box-sizing: border-box; }`}</style>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-5">

        {/* Page header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MdOutlineVerifiedUser className="h-4 w-4" style={{ color: A }} />
              <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">Participant Registry</p>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Create Quality Checker</h1>
            <p className="mt-1 text-sm text-stone-500">Register a new quality checker account</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-stone-200 shadow-sm">
              <span className="text-sm font-semibold text-stone-700">Total: <strong>{stats.total}</strong></span>
              <span className="h-4 w-px bg-stone-200" />
              <span className="text-sm font-semibold text-emerald-700">Active: <strong>{stats.active}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => { dispatch(fetchQualityCheckers()); dispatch(fetchStatesThunk()); }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50 transition shadow-sm"
            >
              <FiRefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
            <FiAlertTriangle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* Create form */}
        <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{ background: A }}>
              <FiUserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-stone-800">Checker Details</p>
              <p className="text-xs text-stone-500">Fill in all required fields</p>
            </div>
          </div>

          <form onSubmit={submit} className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Checker Name"   value={form.checker_name}  onChange={v => setField("checker_name", v)}  required />
              <Field label="Email"          value={form.checker_email} onChange={v => setField("checker_email", v)} required />
              <Field label="Phone"          value={form.checker_phone} onChange={v => setField("checker_phone", v)} required />
              <Select label="State"         value={form.state_id}    onChange={handleStateChange}                loading={statesLoading}    error={statesError}    options={stateOptions}    required />
              <Select label="District"      value={form.district_id} onChange={v => setField("district_id", v)} loading={districtsLoading} error={districtsError} options={districtOptions} required disabled={!form.state_id} />
              <Select label="Location (Port)" value={form.location_id} onChange={v => setField("location_id", v)} loading={locationsLoading} error={locationsError} options={locationOptions} required disabled={!form.state_id} />
            </div>

            <StatusToggle checked={!!form.is_active} onChange={v => setField("is_active", v)} />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60"
                style={{ background: A, boxShadow: "0 4px 14px rgba(217,119,6,0.28)" }}
              >
                {creating
                  ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <FiSave className="h-4 w-4" />}
                {creating ? "Creating…" : "Create Checker"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
