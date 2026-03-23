// src/components/admin/wildcapture/QualityChecker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiAlertTriangle, FiRefreshCcw, FiSave, FiTrash2,
  FiEye, FiX, FiSearch, FiUserCheck, FiEdit2, FiChevronDown,
} from "react-icons/fi";
import { MdOutlineVerifiedUser } from "react-icons/md";
import {
  fetchQualityCheckers,
  createQualityCheckerThunk,
  deleteQualityCheckerThunk,
  fetchQualityCheckerByCodeThunk,
  fetchStatesThunk,
  updateQualityCheckerThunk,
  fetchDistrictsByStateThunk,
  fetchLocationsByStateThunk,
} from "../../../redux/action/qualitycheckerActions";
import {
  clearSearch,
  clearUpdateError,
  clearDistrictsAndLocations,
  setSelected,
} from "../../../redux/reducer/qualitycheckerSlice";

/* ── Theme ── */
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

function pickCode(row)  { return row?.checker_code || row?.code || row?.qc_code || null; }
function fmtStatus(v)   { return v ? "Active" : "Inactive"; }

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
          <option value="">{loading ? "Loading…" : disabled ? `Select State first…` : `Select ${label}…`}</option>
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
          className={`
            pointer-events-none absolute top-0.5 left-0.5
            h-5 w-5 rounded-full bg-white shadow
            transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-stone-50 ring-1 ring-stone-200 p-3.5">
      <p className="text-[10px] font-bold tracking-[0.18em] text-stone-400 uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold text-stone-800 break-words">{value ?? "—"}</p>
    </div>
  );
}

/* ── Main ── */
export default function QualityChecker() {
  const dispatch = useDispatch();
  const {
    list = [], loading, error, creating,
    deletingById = {}, searching, searchError, selected,
    states = [], statesLoading, statesError,
    districts = [], districtsLoading, districtsError,
    locations = [], locationsLoading, locationsError,
    updatingById = {}, updateErrorById = {},
  } = useSelector((s) => s.qualityChecker);

  const [form, setForm]           = useState(EMPTY);
  const [openView, setOpenView]   = useState(false);
  const [openEdit, setOpenEdit]   = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [editForm, setEditForm]   = useState(EMPTY);
  const [codeSearch, setCodeSearch] = useState("");

  useEffect(() => {
    dispatch(fetchQualityCheckers());
    dispatch(fetchStatesThunk());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const stats = useMemo(() => ({
    total:  rows.length,
    active: rows.filter(x => x?.is_active === true).length,
  }), [rows]);

  const stateOptions = useMemo(() =>
    (Array.isArray(states) ? states : []).map(s => ({
      value: String(s?.id ?? s?.state_id),
      label: s?.state_name ?? s?.name ?? `#${s?.id ?? s?.state_id}`,
    })),
  [states]);

  const districtOptions = useMemo(() =>
    (Array.isArray(districts) ? districts : []).map(d => ({
      value: String(d?.id ?? d?.district_id),
      label: d?.district_name ?? d?.name ?? `#${d?.id ?? d?.district_id}`,
    })),
  [districts]);

  const locationOptions = useMemo(() =>
    (Array.isArray(locations) ? locations : []).map(l => ({
      value: String(l?.id ?? l?.location_id),
      label: l?.location_name ?? l?.name ?? `#${l?.id ?? l?.location_id}`,
    })),
  [locations]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* state change — create form */
  const handleCreateStateChange = (v) => {
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

  /* state change — edit form */
  const handleEditStateChange = (v) => {
    setEditForm(p => ({ ...p, state_id: v, district_id: "", location_id: "" }));
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

  const doDelete = async (row) => {
    if (!row?.id) return;
    if (!window.confirm(`Delete quality checker #${row.id}?`)) return;
    await dispatch(deleteQualityCheckerThunk({ id: row.id }));
  };

  const openRowView = (row) => {
    dispatch(clearSearch());
    dispatch(setSelected(row));
    setOpenView(true);
  };

  const searchByCode = async () => {
    const code = codeSearch.trim();
    if (!code) return;
    dispatch(clearSearch());
    setOpenView(true);
    await dispatch(fetchQualityCheckerByCodeThunk({ code }));
  };

  const openEditModal = (row) => {
    setActiveRow(row);
    dispatch(clearUpdateError(row.id));
    const sid = row.state_id ? String(row.state_id) : "";
    setEditForm({
      checker_name:  row.checker_name  || "",
      checker_email: row.checker_email || "",
      checker_phone: row.checker_phone || "",
      state_id:      sid,
      district_id:   row.district_id ? String(row.district_id) : "",
      location_id:   row.location_id  ? String(row.location_id)  : "",
      is_active:     row.is_active ?? true,
    });
    // pre-load districts + locations for the row's state
    if (sid) {
      dispatch(fetchDistrictsByStateThunk(sid));
      dispatch(fetchLocationsByStateThunk(sid));
    }
    setOpenEdit(true);
  };

  const closeEdit = () => {
    setOpenEdit(false);
    setActiveRow(null);
    setEditForm(EMPTY);
    dispatch(clearDistrictsAndLocations());
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!activeRow?.id) return;
    const err = validate(editForm);
    if (err) return alert(err);
    try {
      await dispatch(updateQualityCheckerThunk({
        id: activeRow.id,
        payload: {
          checker_name:  editForm.checker_name.trim(),
          checker_email: editForm.checker_email.trim(),
          checker_phone: editForm.checker_phone.trim(),
          state_id:      Number(editForm.state_id),
          district_id:   Number(editForm.district_id),
          location_id:   Number(editForm.location_id),
          is_active:     !!editForm.is_active,
        },
      })).unwrap();
      dispatch(fetchQualityCheckers());
      closeEdit();
    } catch (_) {}
  };

  const isUpdating = activeRow?.id ? !!updatingById[activeRow.id] : false;
  const updateErr  = activeRow?.id ? updateErrorById[activeRow.id] : null;

  /* ── Render ── */
  return (
    <div className="pccQC min-h-full" style={{ background: "#F7F5F2" }}>
      <style>{`.pccQC * { box-sizing: border-box; }`}</style>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MdOutlineVerifiedUser className="h-4 w-4" style={{ color: A }} />
              <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">Participant Registry</p>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Quality Checker Registry</h1>
            <p className="mt-1 text-sm text-stone-500">Create and manage quality checker accounts</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-stone-200 shadow-sm">
              <span className="text-sm font-semibold text-stone-700">Total: <strong>{stats.total}</strong></span>
              <span className="h-4 w-px bg-stone-200" />
              <span className="text-sm font-semibold text-emerald-700">Active: <strong>{stats.active}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch(fetchQualityCheckers());
                dispatch(fetchStatesThunk());
              }}
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

        {/* ── Form + Search row ── */}
        <div className="grid gap-5 lg:grid-cols-12">

          {/* Create form */}
          <div className="lg:col-span-7 rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{ background: A }}>
                <FiUserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">Create Quality Checker</p>
              </div>
            </div>

            <form onSubmit={submit} className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Checker Name" value={form.checker_name} onChange={v => setField("checker_name", v)} required />
                <Field label="Email"        value={form.checker_email} onChange={v => setField("checker_email", v)} required />
                <Field label="Phone"        value={form.checker_phone} onChange={v => setField("checker_phone", v)} required />

                <Select
                  label="State" value={form.state_id} required
                  onChange={handleCreateStateChange}
                  loading={statesLoading} error={statesError}
                  options={stateOptions}
                />

                <Select
                  label="District" value={form.district_id} required
                  onChange={v => setField("district_id", v)}
                  loading={districtsLoading} error={districtsError}
                  options={districtOptions}
                  disabled={!form.state_id}
                />

                <Select
                  label="Location (Port)" value={form.location_id} required
                  onChange={v => setField("location_id", v)}
                  loading={locationsLoading} error={locationsError}
                  options={locationOptions}
                  disabled={!form.state_id}
                />
              </div>

              <StatusToggle checked={!!form.is_active} onChange={v => setField("is_active", v)} />

              <div className="flex justify-end">
                <button type="submit" disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60"
                  style={{ background: A, boxShadow: "0 4px 14px rgba(217,119,6,0.28)" }}>
                  {creating
                    ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <FiSave className="h-4 w-4" />}
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>

          {/* View by code */}
          <div className="lg:col-span-5 rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0" style={{ background: A }}>
                <FiSearch className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">View by Code</p>
                <p className="text-xs text-stone-500">Search a checker by their QC code</p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 ring-1 ring-stone-200 focus-within:ring-2 transition"
                   style={{ "--tw-ring-color": A }}>
                <FiSearch className="h-4 w-4 text-stone-400 shrink-0" />
                <input
                  value={codeSearch}
                  onChange={e => setCodeSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchByCode()}
                  placeholder="QC-000001"
                  className="h-10 w-full bg-transparent text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400"
                />
              </div>

              {searchError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-200">
                  <FiAlertTriangle className="h-4 w-4 shrink-0" />{searchError}
                </div>
              )}

              <div className="flex justify-end">
                <button type="button" onClick={searchByCode} disabled={searching}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60"
                  style={{ background: A, boxShadow: "0 4px 14px rgba(217,119,6,0.28)" }}>
                  <FiEye className="h-4 w-4" />
                  {searching ? "Loading…" : "View"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-stone-100">
            {loading ? (
              <div className="py-14 text-center text-sm text-stone-400">Loading…</div>
            ) : rows.length === 0 ? (
              <div className="py-14 text-center text-sm text-stone-400">No quality checkers found.</div>
            ) : rows.map(r => {
              const code = pickCode(r);
              return (
                <div key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-stone-800 truncate">{r.checker_name || "—"}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5 font-mono">{code ? `Code: ${code}` : `ID: ${r.id}`}</p>
                      <p className="text-sm text-stone-600 mt-2 truncate">{r.checker_email || "—"}</p>
                      <p className="text-sm text-stone-600 mt-1">{r.checker_phone || "—"}</p>
                      <p className="text-sm text-stone-500 mt-1">{r.location_name || "—"}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${r.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-stone-100 text-stone-500 ring-stone-200"}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {fmtStatus(r.is_active)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => openRowView(r)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditModal(r)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => doDelete(r)} disabled={!!deletingById?.[r.id]}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100 transition disabled:opacity-50">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="text-[10px] font-bold tracking-[0.16em] text-stone-400">
                  {["Checker", "Email", "Phone", "Location", "Status", ""].map(h => (
                    <th key={h} className={`border-b border-stone-100 px-5 py-3 text-left font-semibold ${h === "" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-14 text-center text-sm text-stone-400">Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="py-14 text-center text-sm text-stone-400">No quality checkers found.</td></tr>
                ) : rows.map(r => {
                  const code = pickCode(r);
                  return (
                    <tr key={r.id} className="hover:bg-stone-50/60 transition">
                      <td className="border-b border-stone-100 px-5 py-3.5 align-middle">
                        <p className="font-semibold text-stone-800 truncate">{r.checker_name || "—"}</p>
                        <p className="text-[11px] text-stone-400 font-mono mt-0.5">{code ? `Code: ${code}` : `ID: ${r.id}`}</p>
                      </td>
                      <td className="border-b border-stone-100 px-5 py-3.5 align-middle text-stone-700 truncate max-w-[180px]">{r.checker_email || "—"}</td>
                      <td className="border-b border-stone-100 px-5 py-3.5 align-middle text-stone-700">{r.checker_phone || "—"}</td>
                      <td className="border-b border-stone-100 px-5 py-3.5 align-middle text-stone-700">{r.location_name || "—"}</td>
                      <td className="border-b border-stone-100 px-5 py-3.5 align-middle">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${r.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-stone-100 text-stone-500 ring-stone-200"}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                          {fmtStatus(r.is_active)}
                        </span>
                      </td>
                      <td className="border-b border-stone-100 px-5 py-3.5 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openRowView(r)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button onClick={() => openEditModal(r)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => doDelete(r)} disabled={!!deletingById?.[r.id]}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100 transition disabled:opacity-50">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── View Modal ── */}
      {openView && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setOpenView(false); dispatch(clearSearch()); }} />
          <div className="relative z-10 flex flex-col h-full md:h-auto md:m-auto md:max-h-[90vh] md:w-full md:max-w-2xl bg-white shadow-2xl overflow-hidden md:rounded-2xl md:ring-1 md:ring-black/10">

            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: A }}>
                  <FiUserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Quality Checker Details</p>
                  <p className="text-xs text-stone-500">{searching ? "Loading from code…" : "Full details view"}</p>
                </div>
              </div>
              <button onClick={() => { setOpenView(false); dispatch(clearSearch()); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {searchError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                  <FiAlertTriangle className="h-4 w-4 shrink-0" />{searchError}
                </div>
              )}
              {searching ? (
                <div className="py-14 text-center text-sm text-stone-400">Loading…</div>
              ) : !selected ? (
                <div className="rounded-xl bg-stone-50 ring-1 ring-stone-200 px-4 py-6 text-sm text-stone-500 text-center">
                  No details loaded. Use code search or view a row.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <InfoBox label="Code"   value={selected?.checker_code || selected?.code || selected?.qc_code || "—"} />
                    <InfoBox label="ID"     value={selected?.id} />
                    <InfoBox label="Status" value={fmtStatus(selected?.is_active)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <InfoBox label="Name"  value={selected?.checker_name} />
                    <InfoBox label="Email" value={selected?.checker_email} />
                    <InfoBox label="Phone" value={selected?.checker_phone} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <InfoBox label="State"    value={selected?.state_name} />
                    <InfoBox label="District" value={selected?.district_name} />
                    <InfoBox label="Location" value={selected?.location_name} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <InfoBox label="Created At" value={selected?.created_at ?? "—"} />
                    <InfoBox label="Updated At" value={selected?.updated_at ?? "—"} />
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-stone-100 px-5 py-4 bg-stone-50/60">
              <button onClick={() => { setOpenView(false); dispatch(clearSearch()); }}
                className="w-full rounded-xl bg-stone-200 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-300 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative z-10 flex flex-col h-full md:h-auto md:m-auto md:max-h-[90vh] md:w-full md:max-w-2xl bg-white shadow-2xl overflow-hidden md:rounded-2xl md:ring-1 md:ring-black/10">

            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: A }}>
                  <FiEdit2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Edit Quality Checker</p>
                  <p className="text-xs text-stone-500 font-mono">PUT /api/quality-checker/{activeRow?.id}</p>
                </div>
              </div>
              <button onClick={closeEdit}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 ring-1 ring-stone-200 hover:bg-stone-200 transition">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitEdit} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {updateErr && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                  <FiAlertTriangle className="h-4 w-4 shrink-0" />{updateErr}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Checker Name" value={editForm.checker_name} onChange={v => setEditForm(p => ({ ...p, checker_name: v }))} required />
                <Field label="Email"        value={editForm.checker_email} onChange={v => setEditForm(p => ({ ...p, checker_email: v }))} required />
                <Field label="Phone"        value={editForm.checker_phone} onChange={v => setEditForm(p => ({ ...p, checker_phone: v }))} required />

                <Select
                  label="State" value={editForm.state_id} required
                  onChange={handleEditStateChange}
                  loading={statesLoading} error={statesError}
                  options={stateOptions}
                />

                <Select
                  label="District" value={editForm.district_id} required
                  onChange={v => setEditForm(p => ({ ...p, district_id: v }))}
                  loading={districtsLoading} error={districtsError}
                  options={districtOptions}
                  disabled={!editForm.state_id}
                />

                <Select
                  label="Location (Port)" value={editForm.location_id} required
                  onChange={v => setEditForm(p => ({ ...p, location_id: v }))}
                  loading={locationsLoading} error={locationsError}
                  options={locationOptions}
                  disabled={!editForm.state_id}
                />
              </div>

              <StatusToggle checked={!!editForm.is_active} onChange={v => setEditForm(p => ({ ...p, is_active: v }))} />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeEdit}
                  className="rounded-xl bg-stone-100 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97] disabled:opacity-60"
                  style={{ background: A, boxShadow: "0 4px 14px rgba(217,119,6,0.28)" }}>
                  {isUpdating
                    ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    : <FiSave className="h-4 w-4" />}
                  {isUpdating ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}