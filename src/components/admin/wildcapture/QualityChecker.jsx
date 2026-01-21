// src/components/admin/wildcapture/QualityChecker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiAlertTriangle,
  FiRefreshCcw,
  FiSave,
  FiTrash2,
  FiEye,
  FiX,
  FiSearch,
  FiUserCheck,
  FiEdit2,
} from "react-icons/fi";
import {
  fetchQualityCheckers,
  createQualityCheckerThunk,
  deleteQualityCheckerThunk,
  fetchQualityCheckerByCodeThunk,
  fetchStatesThunk,
  fetchDistrictsThunk,
  updateQualityCheckerThunk,
} from "../../../redux/action/qualitycheckerActions";
import { clearSearch, clearUpdateError } from "../../../redux/reducer/qualitycheckerSlice";

const EMPTY = {
  checker_name: "",
  checker_email: "",
  checker_phone: "",
  state_id: "",
  district_id: "",
  is_active: true, // ✅ default active
};

function pickCode(row) {
  return row?.checker_code || row?.code || row?.qc_code || null;
}

function fmtBool(v) {
  return v ? "Active" : "Inactive";
}

function getStateNameById(statesMap, id) {
  if (id == null) return "—";
  return statesMap.get(Number(id)) || `#${id}`;
}

function getDistrictNameById(districtsMap, id) {
  if (id == null) return "—";
  return districtsMap.get(Number(id)) || `#${id}`;
}

export default function QualityChecker() {
  const dispatch = useDispatch();
  const {
    list = [],
    loading,
    error,
    creating,
    deletingById = {},
    searching,
    searchError,
    selected,

    states = [],
    districts = [],
    statesLoading,
    districtsLoading,
    statesError,
    districtsError,

    updatingById = {},
    updateErrorById = {},
  } = useSelector((s) => s.qualityChecker);

  const [form, setForm] = useState(EMPTY);

  // view modal
  const [openView, setOpenView] = useState(false);

  // edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);

  // top search by code
  const [codeSearch, setCodeSearch] = useState("");

  useEffect(() => {
    dispatch(fetchQualityCheckers());
    dispatch(fetchStatesThunk());
    dispatch(fetchDistrictsThunk());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const statesMap = useMemo(() => {
    const m = new Map();
    (Array.isArray(states) ? states : []).forEach((s) => {
      const id = s?.id ?? s?.state_id;
      const name = s?.state_name ?? s?.name ?? s?.title;
      if (id != null) m.set(Number(id), name || `#${id}`);
    });
    return m;
  }, [states]);

  const districtsMap = useMemo(() => {
    const m = new Map();
    (Array.isArray(districts) ? districts : []).forEach((d) => {
      const id = d?.id ?? d?.district_id;
      const name = d?.district_name ?? d?.name ?? d?.title;
      if (id != null) m.set(Number(id), name || `#${id}`);
    });
    return m;
  }, [districts]);

  const districtsByState = useMemo(() => {
    const selectedStateId = Number(form.state_id || 0);
    const arr = Array.isArray(districts) ? districts : [];
    if (!selectedStateId) return arr;

    // district may have state_id or stateId
    return arr.filter((d) => Number(d?.state_id ?? d?.stateId) === selectedStateId);
  }, [districts, form.state_id]);

  const editDistrictsByState = useMemo(() => {
    const selectedStateId = Number(editForm.state_id || 0);
    const arr = Array.isArray(districts) ? districts : [];
    if (!selectedStateId) return arr;
    return arr.filter((d) => Number(d?.state_id ?? d?.stateId) === selectedStateId);
  }, [districts, editForm.state_id]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((x) => x?.is_active === true).length;
    return { total, active };
  }, [rows]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = (f) => {
    if (!f.checker_name.trim()) return "Checker name required";
    if (!f.checker_email.trim()) return "Checker email required";
    if (!/^\S+@\S+\.\S+$/.test(f.checker_email.trim())) return "Invalid email";
    if (!f.checker_phone.trim()) return "Phone required";
    if (!/^\d{7,15}$/.test(f.checker_phone.trim())) return "Phone must be digits (7-15)";
    if (!f.state_id) return "State is required";
    if (!f.district_id) return "District is required";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) return alert(err);

    const payload = {
      checker_name: form.checker_name.trim(),
      checker_email: form.checker_email.trim(),
      checker_phone: form.checker_phone.trim(),
      state_id: Number(form.state_id),
      district_id: Number(form.district_id),
      is_active: !!form.is_active,
    };

    await dispatch(createQualityCheckerThunk(payload));
    dispatch(fetchQualityCheckers());
    setForm(EMPTY);
  };

  const doDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(`Delete quality checker #${row.id}?`);
    if (!ok) return;
    await dispatch(deleteQualityCheckerThunk({ id: row.id }));
  };

  const openRowView = async (row) => {
    const code = pickCode(row);
    dispatch(clearSearch());
    setOpenView(true);

    if (code) {
      await dispatch(fetchQualityCheckerByCodeThunk({ code }));
    } else {
      // fallback: view row directly
      // If backend doesn’t give code in list
      // we’ll show table row details in modal (below)
    }
  };

  const searchByCode = async () => {
    const code = codeSearch.trim();
    if (!code) return;
    dispatch(clearSearch());
    setOpenView(true);
    await dispatch(fetchQualityCheckerByCodeThunk({ code }));
  };

  const closeView = () => {
    setOpenView(false);
    dispatch(clearSearch());
  };

  const openEditModal = (row) => {
    setActiveRow(row);
    dispatch(clearUpdateError(row.id));

    setEditForm({
      checker_name: row.checker_name || "",
      checker_email: row.checker_email || "",
      checker_phone: row.checker_phone || "",
      state_id: row.state_id ? String(row.state_id) : "",
      district_id: row.district_id ? String(row.district_id) : "",
      is_active: row.is_active ?? true,
    });

    setOpenEdit(true);
  };

  const closeEdit = () => {
    setOpenEdit(false);
    setActiveRow(null);
    setEditForm(EMPTY);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!activeRow?.id) return;

    const err = validate(editForm);
    if (err) return alert(err);

    const payload = {
      checker_name: editForm.checker_name.trim(),
      checker_email: editForm.checker_email.trim(),
      checker_phone: editForm.checker_phone.trim(),
      state_id: Number(editForm.state_id),
      district_id: Number(editForm.district_id),
      is_active: !!editForm.is_active,
    };

    try {
      await dispatch(updateQualityCheckerThunk({ id: activeRow.id, payload })).unwrap();
      dispatch(fetchQualityCheckers());
      closeEdit();
    } catch {
      // error stored in updateErrorById
    }
  };

  const isUpdating = activeRow?.id ? !!updatingById[activeRow.id] : false;
  const updateErr = activeRow?.id ? updateErrorById[activeRow.id] : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-slate-900/5 blur-3xl" />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200 shadow-sm">
                Wild Capture • Master
              </div>
              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Quality Checker Registry
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Form + table. State/District dropdowns powered by backend master APIs.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                  Total: <span className="font-extrabold">{stats.total}</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                  Active: <span className="font-extrabold">{stats.active}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch(fetchQualityCheckers());
                  dispatch(fetchStatesThunk());
                  dispatch(fetchDistrictsThunk());
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <FiRefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <FiAlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Form + View by Code */}
      <div className="mt-5 grid gap-4 lg:grid-cols-12">
        {/* Form */}
        <div className="lg:col-span-7 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <FiUserCheck className="h-4 w-4" />
              Create Quality Checker
            </div>
            <div className="mt-1 text-xs text-slate-500">POST /api/quality-checker/</div>
          </div>

          <form onSubmit={submit} className="px-5 py-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Checker Name" value={form.checker_name} onChange={(v) => setField("checker_name", v)} />
              <Field label="Email" value={form.checker_email} onChange={(v) => setField("checker_email", v)} />
              <Field label="Phone" value={form.checker_phone} onChange={(v) => setField("checker_phone", v)} />

              <div className="grid gap-3 grid-cols-2">
                <Select
                  label="State"
                  value={form.state_id}
                  onChange={(v) => {
                    setField("state_id", v);
                    setField("district_id", ""); // reset district
                  }}
                  loading={statesLoading}
                  error={statesError}
                  options={(Array.isArray(states) ? states : []).map((s) => ({
                    value: String(s?.id ?? s?.state_id),
                    label: s?.state_name ?? s?.name ?? `#${s?.id ?? s?.state_id}`,
                  }))}
                />

                <Select
                  label="District"
                  value={form.district_id}
                  onChange={(v) => setField("district_id", v)}
                  loading={districtsLoading}
                  error={districtsError}
                  options={districtsByState.map((d) => ({
                    value: String(d?.id ?? d?.district_id),
                    label: d?.district_name ?? d?.name ?? `#${d?.id ?? d?.district_id}`,
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700">
                  Status
                </div>
                
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setField("is_active", e.target.checked)}
                  className="h-4 w-4"
                />
                Active
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                  creating ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black",
                ].join(" ")}
              >
                <FiSave className="h-4 w-4" />
                {creating ? "Saving..." : "Create"}
              </button>
            </div>
          </form>
        </div>

        {/* View by code */}
        <div className="lg:col-span-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="text-sm font-extrabold text-slate-900">View by Code</div>
            
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
              <FiSearch className="h-4 w-4 text-slate-400" />
              <input
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value)}
                placeholder="QC-000001"
                className="h-11 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
              />
            </div>

            {searchError && (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <FiAlertTriangle className="mt-0.5 h-4 w-4" />
                <span>{searchError}</span>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={searchByCode}
                disabled={searching}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                  searching ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black",
                ].join(" ")}
              >
                <FiEye className="h-4 w-4" />
                {searching ? "Loading..." : "View"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Desktop table */}
        <div className="hidden lg:block">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[22%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-4">Checker</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">State • District</th>
                <th className="px-5 py-4">Active</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No quality checkers found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const delLoading = !!deletingById?.[r.id];
                  const code = pickCode(r);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-900">
                          {r.checker_name || "—"}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">
                          {code ? `Code: ${code}` : `ID: ${r.id}`}
                        </div>
                      </td>

                      <td className="px-5 py-4 min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800">
                          {r.checker_email || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-800">
                          {r.checker_phone || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {getStateNameById(statesMap, r.state_id)} •{" "}
                          {getDistrictNameById(districtsMap, r.district_id)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
                            r.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-slate-50 text-slate-700",
                          ].join(" ")}
                        >
                          {fmtBool(r.is_active)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openRowView(r)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                            title="View"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(r)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                            title="Edit"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => doDelete(r)}
                            disabled={delLoading}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            title="Delete"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden divide-y divide-slate-200">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">No quality checkers found.</div>
          ) : (
            rows.map((r) => {
              const delLoading = !!deletingById?.[r.id];
              const code = pickCode(r);

              return (
                <div key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-extrabold text-slate-900">
                        {r.checker_name || "—"}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500 truncate">
                        {code ? `Code: ${code}` : `ID: ${r.id}`}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-slate-800 truncate">
                        {r.checker_email || "—"}
                      </div>

                      <div className="mt-1 text-sm font-semibold text-slate-800">
                        {r.checker_phone || "—"}
                      </div>

                      <div className="mt-2 text-xs font-semibold text-slate-700 truncate">
                        {getStateNameById(statesMap, r.state_id)} •{" "}
                        {getDistrictNameById(districtsMap, r.district_id)}
                      </div>

                      <div className="mt-2">
                        <span
                          className={[
                            "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
                            r.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "border-slate-200 bg-slate-50 text-slate-700",
                          ].join(" ")}
                        >
                          {fmtBool(r.is_active)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => openRowView(r)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                        title="View"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(r)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => doDelete(r)}
                        disabled={delLoading}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        title="Delete"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* View Modal */}
      {openView && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="h-full w-full overflow-y-auto p-3 sm:p-6">
            <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
                <div>
                  <div className="text-base font-extrabold text-slate-900">Quality Checker Details</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {searching ? "Loading from code..." : "Full details view"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpenView(false);
                    dispatch(clearSearch());
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 py-5">
                {searchError && (
                  <div className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    <FiAlertTriangle className="mt-0.5 h-4 w-4" />
                    <span>{searchError}</span>
                  </div>
                )}

                {searching ? (
                  <div className="py-10 text-center text-sm text-slate-500">Loading...</div>
                ) : (
                  <DetailsGrid
                    data={selected}
                    statesMap={statesMap}
                    districtsMap={districtsMap}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="h-full w-full overflow-y-auto p-3 sm:p-6">
            <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
                <div>
                  <div className="text-base font-extrabold text-slate-900">Edit Quality Checker</div>
                  <div className="mt-1 text-xs text-slate-500">
                    PUT /api/quality-checker/{activeRow?.id}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeEdit}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={submitEdit} className="px-5 py-5 space-y-4">
                {updateErr && (
                  <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    <FiAlertTriangle className="mt-0.5 h-4 w-4" />
                    <span>{updateErr}</span>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    label="Checker Name"
                    value={editForm.checker_name}
                    onChange={(v) => setEditForm((p) => ({ ...p, checker_name: v }))}
                  />
                  <Field
                    label="Email"
                    value={editForm.checker_email}
                    onChange={(v) => setEditForm((p) => ({ ...p, checker_email: v }))}
                  />
                  <Field
                    label="Phone"
                    value={editForm.checker_phone}
                    onChange={(v) => setEditForm((p) => ({ ...p, checker_phone: v }))}
                  />

                  <div className="grid gap-3 grid-cols-2">
                    <Select
                      label="State"
                      value={editForm.state_id}
                      onChange={(v) => {
                        setEditForm((p) => ({ ...p, state_id: v, district_id: "" }));
                      }}
                      loading={statesLoading}
                      error={statesError}
                      options={(Array.isArray(states) ? states : []).map((s) => ({
                        value: String(s?.id ?? s?.state_id),
                        label: s?.state_name ?? s?.name ?? `#${s?.id ?? s?.state_id}`,
                      }))}
                    />

                    <Select
                      label="District"
                      value={editForm.district_id}
                      onChange={(v) => setEditForm((p) => ({ ...p, district_id: v }))}
                      loading={districtsLoading}
                      error={districtsError}
                      options={editDistrictsByState.map((d) => ({
                        value: String(d?.id ?? d?.district_id),
                        label: d?.district_name ?? d?.name ?? `#${d?.id ?? d?.district_id}`,
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700">
                      Status
                    </div>
                    <div className="mt-1 text-xs text-slate-500">Toggle is_active</div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={!!editForm.is_active}
                      onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={[
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                      isUpdating ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black",
                    ].join(" ")}
                  >
                    <FiSave className="h-4 w-4" />
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, loading, error }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
      >
        <option value="">
          {loading ? "Loading..." : `Select ${label}…`}
        </option>

        {Array.isArray(options) &&
          options
            .filter((o) => o?.value)
            .map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
      </select>

      {error ? (
        <div className="mt-1 text-[11px] text-rose-700">{error}</div>
      ) : (
        <div className="mt-1 text-[11px] text-slate-500"> </div>
      )}
    </div>
  );
}

function DetailsGrid({ data, statesMap, districtsMap }) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No details loaded. Use code search or view a row that has a code.
      </div>
    );
  }

  const code = data?.checker_code || data?.code || data?.qc_code || "—";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Code" value={code} />
        <Info label="ID" value={data?.id ?? "—"} />
        <Info label="Active" value={data?.is_active ? "true" : "false"} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Name" value={data?.checker_name ?? "—"} />
        <Info label="Email" value={data?.checker_email ?? "—"} />
        <Info label="Phone" value={data?.checker_phone ?? "—"} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Info label="State" value={getStateNameById(statesMap, data?.state_id)} />
        <Info label="District" value={getDistrictNameById(districtsMap, data?.district_id)} />
        <Info label="Created At" value={data?.created_at ?? "—"} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Updated At" value={data?.updated_at ?? "—"} />
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900 break-words">{value}</div>
    </div>
  );
}
