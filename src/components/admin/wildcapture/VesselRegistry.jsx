// src/components/admin/wildcapture/VesselRegistry.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiEdit2,
  FiSave,
  FiX,
  FiAlertTriangle,
  FiRefreshCcw,
  FiTool,
  FiUser,
  FiMapPin,
  FiSearch,
  FiChevronDown,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import {
  fetchVessels,
  createVessel,
  updateVessel,
  fetchOwnersForVesselDropdown,
} from "../../../redux/action/vesselActions";

const ALLOWED_METHODS = new Set(["Trawl", "Gillnet", "Longline", "Purse seine"]);
const METHODS = Array.from(ALLOWED_METHODS);

const PAGE_SIZE = 10;

const EMPTY = {
  owner_id: "",
  govt_registration_number: "",
  local_identifier: "",
  vessel_name: "",
  home_port: "",
  vessel_type: "",
  allowed_fishing_methods: "", // backend expects single string
};

export default function VesselRegistry() {
  const dispatch = useDispatch();
  const {
    list = [],
    loading = false,
    error = null,
    creating = false,
    updatingById = {},
    owners = [],
    ownersLoading = false,
    ownersError = null,
  } = useSelector((s) => s.vessel);

  // Modals
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);

  const [mode, setMode] = useState("create"); // create | edit
  const [active, setActive] = useState(null);
  const [form, setForm] = useState(EMPTY);

  // Pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchVessels());
    dispatch(fetchOwnersForVesselDropdown());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  // Owners map (for view modal label)
  const ownersMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(owners) ? owners : []).forEach((o) => map.set(String(o.id), o));
    return map;
  }, [owners]);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const openCreate = () => {
    setMode("create");
    setActive(null);
    setForm(EMPTY);
    setOpenForm(true);
  };

  const openEdit = (v) => {
    setMode("edit");
    setActive(v);
    setForm({
      owner_id: v.owner_id ?? "",
      govt_registration_number: v.govt_registration_number || "",
      local_identifier: v.local_identifier || "",
      vessel_name: v.vessel_name || "",
      home_port: v.home_port || "",
      vessel_type: v.vessel_type || "",
      allowed_fishing_methods: v.allowed_fishing_methods || "",
    });
    setOpenForm(true);
  };

  const openDetails = (v) => {
    setActive(v);
    setOpenView(true);
  };

  const closeAll = () => {
    setOpenForm(false);
    setOpenView(false);
    setActive(null);
    setForm(EMPTY);
  };

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.owner_id) return "Owner is required";
    if (!form.govt_registration_number.trim()) return "Govt registration number required";
    if (!form.vessel_name.trim()) return "Vessel name required";
    if (!form.home_port.trim()) return "Home port required";
    if (!form.vessel_type.trim()) return "Vessel type required";
    if (!form.allowed_fishing_methods) return "Select one allowed fishing method";
    if (!ALLOWED_METHODS.has(form.allowed_fishing_methods)) return "Invalid fishing method";
    return null;
  };

  const saving =
    creating || (mode === "edit" && active?.id ? !!updatingById?.[active.id] : false);

  const submit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    const payload = {
      owner_id: Number(form.owner_id),
      govt_registration_number: form.govt_registration_number.trim(),
      local_identifier: form.local_identifier.trim(),
      vessel_name: form.vessel_name.trim(),
      home_port: form.home_port.trim(),
      vessel_type: form.vessel_type.trim(),
      allowed_fishing_methods: form.allowed_fishing_methods, // string
    };

    if (mode === "create") {
      await dispatch(createVessel(payload));
      await dispatch(fetchVessels());
      setPage(1);
      closeAll();
    } else if (mode === "edit" && active?.id) {
      await dispatch(updateVessel({ id: active.id, payload }));
      await dispatch(fetchVessels());
      closeAll();
    }
  };

  const ownerLabel = (ownerId) => {
    if (ownerId == null) return "—";
    const o = ownersMap.get(String(ownerId));
    if (!o) return `#${ownerId}`;
    const line2 = [o.phone_no, o.district_name || o.address].filter(Boolean).join(" • ");
    return `${o.username || "Owner"}${line2 ? ` — ${line2}` : ""}`;
  };

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
                Wild Capture • Registry
              </div>
              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Vessel Registry
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Clean table. Extra fields moved into the View popup. 10 per page.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => dispatch(fetchVessels())}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <FiRefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(15,23,42,0.22)] hover:bg-black"
              >
                <FiPlus className="h-4 w-4" />
                Register Vessel
              </button>
            </div>
          </div>

          {(error || ownersError) && (
            <div className="mt-4 space-y-2">
              {error && (
                <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  <FiAlertTriangle className="mt-0.5 h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              {ownersError && (
                <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <FiAlertTriangle className="mt-0.5 h-4 w-4" />
                  <span>{ownersError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table/Card container */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Desktop table (NO horizontal scroll; minimal columns) */}
        <div className="hidden lg:block">
          <table className="w-full table-fixed">
            <colgroup>
              {/* FIX: give Actions more room; reduce Vessel a bit to keep total 100% */}
              <col className="w-[34%]" />
              <col className="w-[22%]" />
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-4">Vessel</th>
                <th className="px-5 py-4">Govt Reg No</th>
                <th className="px-5 py-4">Home Port</th>
                <th className="px-5 py-4">Method</th>

                {/* FIX: avoid wrap + use slightly smaller padding on Actions */}
                <th className="px-4 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    No vessels found.
                  </td>
                </tr>
              ) : (
                pagedRows.map((v) => {
                  const isUpdating = !!updatingById[v.id];
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-900">
                          {v.vessel_name || "—"}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">
                          Local: {v.local_identifier || "—"} • Type: {v.vessel_type || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800">
                          {v.govt_registration_number || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 min-w-0">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <FiMapPin className="h-4 w-4 text-slate-500" />
                          <span className="truncate">{v.home_port || "—"}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex max-w-full truncate rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900">
                          {v.allowed_fishing_methods || "—"}
                        </span>
                      </td>

                      {/* FIX: match header padding so column doesn't get squeezed by px-5 */}
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(v)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                            title="View"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(v)}
                            disabled={isUpdating}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                            title="Edit"
                          >
                            <FiEdit2 className="h-4 w-4" />
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

        {/* Mobile cards (10 per page too) */}
        <div className="lg:hidden divide-y divide-slate-200">
          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
          ) : pagedRows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">No vessels found.</div>
          ) : (
            pagedRows.map((v) => (
              <div key={v.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-extrabold text-slate-900">
                      {v.vessel_name || "—"}
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 truncate">
                      Reg:{" "}
                      <span className="font-semibold text-slate-800">
                        {v.govt_registration_number || "—"}
                      </span>
                    </div>

                    <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <FiMapPin className="h-4 w-4 text-slate-500" />
                      <span className="truncate">{v.home_port || "—"}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900">
                        <FiTool className="h-4 w-4" />
                        {v.allowed_fishing_methods || "—"}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-500">
                      Local:{" "}
                      <span className="font-semibold text-slate-800">
                        {v.local_identifier || "—"}
                      </span>{" "}
                      • Type:{" "}
                      <span className="font-semibold text-slate-800">
                        {v.vessel_type || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(v)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                      title="View"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(v)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination footer */}
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of <span className="font-semibold text-slate-900">{total}</span>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                <FiChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800">
                Page <span className="font-extrabold">{page}</span> /{" "}
                <span className="font-extrabold">{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
                <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODAL (extra columns here) */}
      {openView && active && (
        <ModalShell title="Vessel Details" onClose={closeAll} size="max-w-4xl">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-extrabold text-slate-900 truncate">
                  {active.vessel_name || "—"}
                </div>
                <div className="mt-1 text-sm text-slate-600 truncate">
                  Govt Reg:{" "}
                  <span className="font-semibold text-slate-900">
                    {active.govt_registration_number || "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenView(false);
                    openEdit(active);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                >
                  <FiEdit2 className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard label="Owner" icon={FiUser} value={ownerLabel(active.owner_id)} />
              <InfoCard label="Home Port" icon={FiMapPin} value={active.home_port || "—"} />
              <InfoCard label="Method" icon={FiTool} value={active.allowed_fishing_methods || "—"} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard label="Local Identifier" value={active.local_identifier || "—"} />
              <InfoCard label="Vessel Type" value={active.vessel_type || "—"} />
              <InfoCard label="Vessel ID" value={active.id ?? "—"} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700">
                Notes
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Table stays clean. Everything else is here.
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {/* CREATE/EDIT MODAL (fits viewport + scroll + searchable owner) */}
      {openForm && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="h-full w-full overflow-y-auto p-3 sm:p-6">
            <div className="mx-auto w-full max-w-3xl">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <div className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-h-[calc(100vh-3rem)]">
                  {/* header */}
                  <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
                    <div>
                      <div className="text-base font-extrabold text-slate-900">
                        {mode === "create" ? "Register Vessel" : "Edit Vessel"}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Allowed method is a single value.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeAll}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>

                  {/* body */}
                  <form
                    id="vesselForm"
                    onSubmit={submit}
                    className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
                  >
                    <OwnerCombobox
                      value={form.owner_id}
                      onChange={(id) => setField("owner_id", String(id))}
                      owners={owners}
                      loading={ownersLoading}
                      onReload={() => dispatch(fetchOwnersForVesselDropdown())}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <Field
                        label="Govt Registration Number"
                        value={form.govt_registration_number}
                        onChange={(v) => setField("govt_registration_number", v)}
                        placeholder="TN-12345-ABC"
                      />
                      <Field
                        label="Local Identifier"
                        value={form.local_identifier}
                        onChange={(v) => setField("local_identifier", v)}
                        placeholder="Local-001"
                      />
                      <Field
                        label="Vessel Name"
                        value={form.vessel_name}
                        onChange={(v) => setField("vessel_name", v)}
                        placeholder="Ocean Explorer"
                      />
                      <Field
                        label="Home Port"
                        value={form.home_port}
                        onChange={(v) => setField("home_port", v)}
                        placeholder="Chennai"
                      />
                      <Field
                        label="Vessel Type"
                        value={form.vessel_type}
                        onChange={(v) => setField("vessel_type", v)}
                        placeholder="Fishing Vessel"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-700">
                        <FiTool className="h-4 w-4" />
                        Allowed Fishing Method
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {METHODS.map((m) => {
                          const activeBtn = form.allowed_fishing_methods === m;
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setField("allowed_fishing_methods", m)}
                              className={[
                                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                                activeBtn
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                              ].join(" ")}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2 text-[11px] text-slate-500">
                        Backend expects a single string (example:{" "}
                        <span className="font-semibold">Trawl</span>).
                      </div>
                    </div>
                  </form>

                  {/* footer */}
                  <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
                    <button
                      type="button"
                      onClick={closeAll}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      form="vesselForm"
                      type="submit"
                      disabled={saving}
                      className={[
                        "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white",
                        saving ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black",
                      ].join(" ")}
                    >
                      <FiSave className="h-4 w-4" />
                      {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center text-[11px] text-white/70">
                Modal fits viewport. Scroll happens inside.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */

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

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900 break-words">{value}</div>
    </div>
  );
}

function ModalShell({ title, onClose, size = "max-w-3xl", children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-full w-full overflow-y-auto p-3 sm:p-6">
        <div className={`mx-auto w-full ${size}`}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div className="text-base font-extrabold text-slate-900">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Searchable owner dropdown (combobox, client-side filter; fine for now) */
function OwnerCombobox({ value, onChange, owners = [], loading, onReload }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = useMemo(() => {
    const idStr = value == null ? "" : String(value);
    return (owners || []).find((o) => String(o.id) === idStr) || null;
  }, [owners, value]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const arr = Array.isArray(owners) ? owners : [];
    if (!s) return arr;
    return arr.filter((o) => {
      const hay = `${o.username || ""} ${o.phone_no || ""} ${o.address || ""} ${
        o.district_name || ""
      }`.toLowerCase();
      return hay.includes(s);
    });
  }, [owners, q]);

  const choose = (id) => {
    onChange(id);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={wrapRef}>
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
        Owner
      </label>

      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="mt-2 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left hover:bg-slate-50"
      >
        <div className="min-w-0">
          {selected ? (
            <>
              <div className="truncate text-sm font-extrabold text-slate-900">
                {selected.username || "Owner"}
              </div>
              <div className="truncate text-[11px] text-slate-500">
                {[selected.phone_no, selected.district_name || selected.address]
                  .filter(Boolean)
                  .join(" • ") || "—"}
              </div>
            </>
          ) : (
            <div className="text-sm font-semibold text-slate-500">Select owner…</div>
          )}
        </div>

        <FiChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
      </button>

      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
        <span>{loading ? "Loading owners..." : " "}</span>
        <button
          type="button"
          onClick={onReload}
          className="font-semibold text-slate-700 hover:text-slate-900"
        >
          Reload owners
        </button>
      </div>

      {open && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
          <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
            <FiSearch className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search owner name / phone / district…"
              className="h-10 w-full bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-3 text-sm text-slate-500">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500">No matches.</div>
            ) : (
              filtered.slice(0, 200).map((o) => {
                const active = String(o.id) === String(value);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => choose(o.id)}
                    className={[
                      "w-full px-3 py-2 text-left transition",
                      active ? "bg-slate-900 text-white" : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="truncate text-sm font-extrabold">
                      {o.username || "Owner"}
                    </div>
                    <div
                      className={
                        "truncate text-[11px] " + (active ? "text-white/70" : "text-slate-500")
                      }
                    >
                      {[o.phone_no, o.district_name || o.address].filter(Boolean).join(" • ") ||
                        "—"}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 px-3 py-2 text-[11px] text-slate-500">
            Showing {Math.min(filtered.length, 200)} / {filtered.length}. (Later: server-side search.)
          </div>
        </div>
      )}
    </div>
  );
}
