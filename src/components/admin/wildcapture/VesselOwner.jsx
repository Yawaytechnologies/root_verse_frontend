import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiEdit2,
  FiEye,
  FiX,
  FiRefreshCcw,
  FiAlertTriangle,
  FiSave,
  FiExternalLink,
} from "react-icons/fi";

import {
  getWildCaptureOwners,
  updateOwnerVerification,
} from "../../../redux/action/vesselownerActions";
import { clearUpdateError } from "../../../redux/reducer/vesselownerSlice";

const MAX_FILE_MB = 10;
const ACCEPT = "image/jpeg,application/pdf";

function isValidFile(file) {
  if (!file) return true;
  const okType = file.type === "image/jpeg" || file.type === "application/pdf";
  const okSize = file.size <= MAX_FILE_MB * 1024 * 1024;
  return okType && okSize;
}

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

function FieldRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-900 break-words">
        {value ?? "—"}
      </div>
    </div>
  );
}

function LinkRow({ label, url }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-1">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 underline decoration-slate-300 hover:decoration-slate-900"
          >
            Open <FiExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <div className="text-sm font-medium text-slate-900">—</div>
        )}
      </div>
    </div>
  );
}

export default function OwnerDetailsTable() {
  const dispatch = useDispatch();

  // ✅ Fix A: store key = owner
  const {
    list = [],
    loading = false,
    error = null,
    updatingById = {},
    updateErrorById = {},
  } = useSelector((s) => s.owner);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [active, setActive] = useState(null);

  const [form, setForm] = useState({
    // UI-only
    username: "",
    phone_no: "",
    address: "",
    state_name: "",
    district_name: "",

    // ✅ correct name
    aadhar_number: "",
    pan_number: "",
    govt_id: "",

    // files
    aadhar: null,
    pan: null,
    govt: null,
  });

  useEffect(() => {
    dispatch(getWildCaptureOwners());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const openUpdateModal = (u) => {
    setActive(u);
    dispatch(clearUpdateError(u.id));

    setForm({
      username: u.username || "",
      phone_no: u.phone_no || "",
      address: u.address || "",
      state_name: u.state_name || "",
      district_name: u.district_name || "",

      aadhar_number: u.aadhar_number || "",
      pan_number: u.pan_number || "",
      govt_id: u.govt_id || "",

      aadhar: null,
      pan: null,
      govt: null,
    });

    setOpenUpdate(true);
  };

  const openViewModal = (u) => {
    setActive(u);
    setOpenView(true);
  };

  const closeAll = () => {
    setOpenUpdate(false);
    setOpenView(false);
    setActive(null);
  };

  const pickFile = (key, file) => {
    if (file && !isValidFile(file)) {
      alert(`Only JPG/PDF up to ${MAX_FILE_MB}MB allowed.`);
      return;
    }
    setForm((p) => ({ ...p, [key]: file }));
  };

  const submitUpdate = async () => {
    if (!active?.id) return;

    if (!form.aadhar_number?.trim()) {
      alert("Aadhar number required");
      return;
    }

    if (!isValidFile(form.aadhar) || !isValidFile(form.pan) || !isValidFile(form.govt)) {
      alert(`Only JPG/PDF up to ${MAX_FILE_MB}MB allowed.`);
      return;
    }

    try {
      await dispatch(
        updateOwnerVerification({
          ownerId: active.id,
          payload: {
            aadhar_number: form.aadhar_number,
            pan_number: form.pan_number,
            govt_id: form.govt_id,
            aadhar: form.aadhar,
            pan: form.pan,
            govt: form.govt,
          },
        })
      ).unwrap();

      setOpenUpdate(false);
      setActive(null);
    } catch {
      // slice already stores error
    }
  };

  const isUpdating = active?.id ? !!updatingById?.[active.id] : false;
  const activeErr = active?.id ? updateErrorById?.[active.id] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm font-sans">
      <div className="flex items-start sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Vessel Owners</h2>
          <p className="text-xs text-slate-500">
            Total: <span className="font-semibold text-slate-900">{rows.length}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(getWildCaptureOwners())}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
        >
          <FiRefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
          <FiAlertTriangle className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ✅ MOBILE VIEW (cards) */}
      <div className="md:hidden">
        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">No owners found.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {rows.map((u) => (
              <div key={u.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.profile_picture_url || ""}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover bg-slate-100"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {u.username}
                      </div>
                      <div className="truncate text-[12px] text-slate-500">
                        {u.phone_no} • {u.address}
                      </div>
                      <div className="truncate text-[12px] text-slate-500 mt-0.5">
                        {u.state_name} • {u.district_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openViewModal(u)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                      aria-label="View"
                      title="View"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openUpdateModal(u)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                      aria-label="Update"
                      title="Update"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {u.verification_status || "PENDING"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {u.updated_at ? `Updated: ${fmtDate(u.updated_at)}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ DESKTOP/TABLE VIEW (md+) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-slate-100">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th className="px-4 py-3 w-[44%]">Owner</th>
              <th className="px-4 py-3 w-[28%]">Location</th>
              <th className="px-4 py-3 w-[16%]">Status</th>
              <th className="px-4 py-3 w-[12%] text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                  No owners found.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 max-w-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.profile_picture_url || ""}
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover bg-slate-100"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {u.username}
                        </div>
                        <div className="truncate text-[12px] text-slate-500">
                          {u.phone_no} • {u.address}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700 truncate">
                      {u.state_name} • {u.district_name}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {u.verification_status || "PENDING"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openViewModal(u)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                        aria-label="View"
                        title="View"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openUpdateModal(u)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                        aria-label="Update"
                        title="Update"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ VIEW MODAL (fits viewport; scroll inside) */}
      {openView && active && (
        <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4">
          <div className="mx-auto flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Owner Details</div>
                <div className="text-xs text-slate-500">
                  User ID: <span className="font-semibold">{active.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAll}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={active.profile_picture_url || ""}
                  alt=""
                  className="h-14 w-14 rounded-2xl object-cover bg-slate-100"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-slate-900 truncate">
                    {active.username}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    {active.phone_no} • {active.address}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <FieldRow label="RootVerse Type" value={active.rootverse_type} />
                <FieldRow label="Verification Status" value={active.verification_status} />
                <FieldRow label="Owner ID" value={active.owner_id ?? "—"} />
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <FieldRow label="State" value={active.state_name} />
                <FieldRow label="District" value={active.district_name} />
                <FieldRow label="Address" value={active.address} />
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <FieldRow label="Created At" value={fmtDate(active.created_at)} />
                <FieldRow label="Updated At" value={fmtDate(active.updated_at)} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-800">KYC</div>

                <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <FieldRow label="Aadhar Number" value={active.aadhar_number ?? "—"} />
                  <FieldRow label="PAN Number" value={active.pan_number ?? "—"} />
                  <FieldRow label="Govt ID" value={active.govt_id ?? "—"} />
                </div>

                <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <LinkRow label="Aadhar Doc" url={active.aadhar_pdf_url} />
                  <LinkRow label="PAN Doc" url={active.pan_pdf_url} />
                  <LinkRow label="Govt Doc" url={active.govt_pdf_url} />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-4 py-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpenView(false);
                  openUpdateModal(active);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <FiEdit2 className="h-4 w-4" />
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ UPDATE MODAL (fits viewport; scroll inside) */}
      {openUpdate && (
        <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4">
          <div className="mx-auto flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Update Owner</div>
                <div className="text-xs text-slate-500">
                  User ID: <span className="font-semibold">{active?.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAll}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {activeErr && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  {activeErr}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-800">KYC Verification</div>

                <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Aadhar Number"
                    value={form.aadhar_number}
                    onChange={(v) => setForm((p) => ({ ...p, aadhar_number: v }))}
                  />
                  <Field
                    label="PAN Number"
                    value={form.pan_number}
                    onChange={(v) => setForm((p) => ({ ...p, pan_number: v }))}
                  />
                  <Field
                    label="Govt ID"
                    value={form.govt_id}
                    onChange={(v) => setForm((p) => ({ ...p, govt_id: v }))}
                  />
                </div>

                <div className="mt-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <FileField
                    label="Aadhar File"
                    hint={`JPG/PDF ≤ ${MAX_FILE_MB}MB`}
                    onPick={(f) => pickFile("aadhar", f)}
                  />
                  <FileField
                    label="PAN File"
                    hint={`JPG/PDF ≤ ${MAX_FILE_MB}MB`}
                    onPick={(f) => pickFile("pan", f)}
                  />
                  <FileField
                    label="Govt File"
                    hint={`JPG/PDF ≤ ${MAX_FILE_MB}MB`}
                    onPick={(f) => pickFile("govt", f)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <div className="text-xs text-slate-500">
                PUT: <span className="font-semibold">/api/owner/{active?.id}/verify</span>
              </div>

              <button
                type="button"
                onClick={submitUpdate}
                disabled={isUpdating}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow
                  ${isUpdating ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"}`}
              >
                <FiSave className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
      />
    </div>
  );
}

function FileField({ label, hint, onPick }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="file"
        accept={ACCEPT}
        onChange={(e) => onPick(e.target.files?.[0] || null)}
        className="mt-1 block w-full text-xs text-slate-700 file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold hover:file:bg-slate-100"
      />
      <div className="mt-1 text-[11px] text-slate-500">{hint}</div>
    </div>
  );
}
