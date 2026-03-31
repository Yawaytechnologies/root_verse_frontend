import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiRefreshCw, FiEdit2, FiChevronLeft, FiChevronRight,
  FiAlertCircle, FiX, FiCheck, FiLoader, FiMapPin, FiPhone,
  FiFilter, FiPlus, FiEye, FiMail, FiUser,
} from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { BsSnow2 } from "react-icons/bs";

import { fetchCollectionCenters, updateCollectionCenter, fetchCenterDetail } from "../../../redux/action/collectionCenterActions";
import {
  resetUpdate, clearDetail, setPage,
  selectList, selectListLoading, selectListError,
  selectCurrentPage, selectPageSize, selectTotalCount,
  selectUpdateLoading, selectUpdateError, selectUpdateSuccess,
  selectDetail, selectDetailLoading,
} from "../../../redux/reducer/collectionCenterSlice";

/* ─── Theme ─────────────────────────────────────────────── */
const T = {
  accent:       "#D97706",
  accentLight:  "#FEF3C7",
  pageBg:       "#FAFAF9",
  cardBg:       "#FFFFFF",
  border:       "#E7E5E4",
  textPrimary:  "#1C1917",
  textSecondary:"#57534E",
  textMuted:    "#A8A29E",
  errorText:    "#BE123C",
  errorBg:      "#FFF1F2",
  errorBorder:  "#FECDD3",
  successText:  "#15803D",
  successBg:    "#F0FDF4",
};

/* ─── Status badge ───────────────────────────────────────── */
function StatusBadge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={active
        ? { background: "#DCFCE7", color: "#15803D" }
        : { background: "#F5F5F4", color: "#78716C" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "#16A34A" : "#A8A29E" }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ─── Cold storage badge ──────────────────────────────────── */
function ColdBadge({ value }) {
  if (!value) return <span className="text-xs text-stone-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
      <BsSnow2 className="h-3 w-3" /> Yes
    </span>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewModal({ centreId, onClose }) {
  const dispatch      = useDispatch();
  const detail        = useSelector(selectDetail);
  const detailLoading = useSelector(selectDetailLoading);

  useEffect(() => {
    dispatch(fetchCenterDetail(centreId));
    return () => dispatch(clearDetail());
  }, [centreId, dispatch]);

  function Row({ label, value }) {
    if (!value && value !== 0) return null;
    return (
      <div className="flex flex-col gap-0.5 py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>{label}</span>
        <span className="text-sm font-medium" style={{ color: T.textPrimary }}>{value}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: T.cardBg }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "#EFF6FF" }}>
              <FiEye className="h-4 w-4" style={{ color: "#1D4ED8" }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: T.textPrimary }}>Centre Details</p>
              <p className="text-xs font-mono" style={{ color: T.textMuted }}>{centreId}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors">
            <FiX className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-2 max-h-[75vh] overflow-y-auto">
          {detailLoading && (
            <div className="flex items-center justify-center py-12 gap-2" style={{ color: T.textMuted }}>
              <FiLoader className="h-5 w-5 animate-spin" style={{ color: T.accent }} />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {!detailLoading && detail && (
            <>
              {/* Status + Cold badge row */}
              <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor: T.border }}>
                <StatusBadge status={detail.status} />
                <ColdBadge value={detail.cold_storage_available} />
                {detail.cold_storage_capacity_kg && (
                  <span className="text-xs" style={{ color: T.textMuted }}>
                    {detail.cold_storage_capacity_kg} kg capacity
                  </span>
                )}
              </div>

              {/* Section: Identity */}
              <p className="mt-3 mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: T.accent }}>Identity</p>
              <Row label="Centre ID"   value={detail.centre_id} />
              <Row label="Centre Name" value={detail.centre_name} />

              {/* Section: Location */}
              <p className="mt-3 mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: T.accent }}>Location</p>
              <Row label="State"          value={detail.state} />
              <Row label="District"       value={detail.district} />
              <Row label="Address Line 1" value={detail.address_line_1} />
              <Row label="Address Line 2" value={detail.address_line_2} />
              <Row label="Pincode"        value={detail.pincode} />
              {(detail.gps_lat || detail.gps_lng) && (
                <div className="flex flex-col gap-0.5 py-2.5 border-b" style={{ borderColor: T.border }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>GPS Coordinates</span>
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="h-3.5 w-3.5 shrink-0" style={{ color: T.textMuted }} />
                    <span className="text-sm font-mono" style={{ color: T.textPrimary }}>
                      {detail.gps_lat}, {detail.gps_lng}
                    </span>
                  </div>
                </div>
              )}

              {/* Section: Contact */}
              <p className="mt-3 mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: T.accent }}>Contact</p>
              <div className="flex flex-col gap-0.5 py-2.5 border-b" style={{ borderColor: T.border }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Contact Person</span>
                <div className="flex items-center gap-1.5">
                  <FiUser className="h-3.5 w-3.5 shrink-0" style={{ color: T.textMuted }} />
                  <span className="text-sm font-medium" style={{ color: T.textPrimary }}>{detail.contact_name}</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 py-2.5 border-b" style={{ borderColor: T.border }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Mobile</span>
                <div className="flex items-center gap-1.5">
                  <FiPhone className="h-3.5 w-3.5 shrink-0" style={{ color: T.textMuted }} />
                  <span className="text-sm font-medium" style={{ color: T.textPrimary }}>{detail.contact_mobile}</span>
                </div>
              </div>
              {detail.email && (
                <div className="flex flex-col gap-0.5 py-2.5" style={{ borderColor: T.border }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Email</span>
                  <div className="flex items-center gap-1.5">
                    <FiMail className="h-3.5 w-3.5 shrink-0" style={{ color: T.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: T.textPrimary }}>{detail.email}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-end" style={{ borderColor: T.border, background: "#FAFAF9" }}>
          <button onClick={onClose}
            className="rounded-xl px-5 py-2 text-sm font-semibold border transition hover:bg-stone-100"
            style={{ color: T.textSecondary, borderColor: T.border }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ─────────────────────────────────────────── */
function EditModal({ centre, onClose }) {
  const dispatch      = useDispatch();
  const updateLoading = useSelector(selectUpdateLoading);
  const updateError   = useSelector(selectUpdateError);
  const updateSuccess = useSelector(selectUpdateSuccess);

  // Only the 3 fields the API allows to be updated
  const [form, setForm] = useState({
    status:                   centre.status ?? "ACTIVE",
    contact_mobile:           centre.contact_mobile ?? "",
    cold_storage_capacity_kg: centre.cold_storage_capacity_kg != null ? String(centre.cold_storage_capacity_kg) : "",
  });

  // Close on success after short delay
  useEffect(() => {
    if (updateSuccess) {
      const t = setTimeout(() => { dispatch(resetUpdate()); onClose(); }, 900);
      return () => clearTimeout(t);
    }
  }, [updateSuccess, dispatch, onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    // Build diff — only send what actually changed, only from allowed fields
    const payload = {};
    if (form.status !== centre.status)
      payload.status = form.status;
    if (form.contact_mobile !== (centre.contact_mobile ?? ""))
      payload.contact_mobile = form.contact_mobile;
    const origCap = centre.cold_storage_capacity_kg != null ? String(centre.cold_storage_capacity_kg) : "";
    if (form.cold_storage_capacity_kg !== origCap)
      payload.cold_storage_capacity_kg = form.cold_storage_capacity_kg !== ""
        ? parseInt(form.cold_storage_capacity_kg, 10)
        : null;

    if (Object.keys(payload).length === 0) { onClose(); return; }
    dispatch(updateCollectionCenter({ centreId: centre.centre_id, payload }));
  }

  const inp = (err) => [
    "w-full h-10 rounded-xl text-sm border px-3.5 outline-none transition-all",
    err
      ? "bg-rose-50 border-rose-300 text-rose-900"
      : "bg-stone-50 border-stone-200 text-stone-800 focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
  ].join(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: T.cardBg }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: T.accent }}>
              <FiEdit2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: T.textPrimary }}>Edit Centre</p>
              <p className="text-xs" style={{ color: T.textMuted }}>{centre.centre_id}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors">
            <FiX className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Error */}
        {updateError && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 border text-sm"
            style={{ background: T.errorBg, borderColor: T.errorBorder, color: T.errorText }}>
            <FiAlertCircle className="h-4 w-4 shrink-0" />
            {updateError.message ?? "Update failed."}
          </div>
        )}

        {/* Success */}
        {updateSuccess && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 border text-sm"
            style={{ background: T.successBg, color: T.successText, borderColor: "#BBF7D0" }}>
            <FiCheck className="h-4 w-4 shrink-0" /> Updated successfully!
          </div>
        )}

        {/* Read-only info strip */}
        <div className="mx-5 mt-4 rounded-xl px-4 py-3 border space-y-1"
          style={{ background: "#FAFAF9", borderColor: T.border }}>
          <p className="text-xs font-semibold" style={{ color: T.textMuted }}>Centre Info (read-only)</p>
          <p className="text-sm font-medium" style={{ color: T.textPrimary }}>{centre.centre_name}</p>
          <p className="text-xs" style={{ color: T.textMuted }}>{centre.district}, {centre.state}</p>
        </div>

        {/* Form — only 3 allowed fields */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Status */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.textSecondary }}>
                Status <span style={{ color: T.accent }}>*</span>
              </label>
              <div className="flex gap-3">
                {["ACTIVE", "INACTIVE"].map(s => (
                  <button key={s} type="button"
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold border transition-all"
                    style={form.status === s
                      ? s === "ACTIVE"
                        ? { background: "#DCFCE7", borderColor: "#16A34A", color: "#15803D" }
                        : { background: "#FEE2E2", borderColor: "#DC2626", color: "#B91C1C" }
                      : { background: "#F5F5F4", borderColor: T.border, color: T.textMuted }}>
                    {s === "ACTIVE" ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Mobile */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.textSecondary }}>Contact Mobile</label>
              <input
                type="tel"
                className={inp(false)}
                value={form.contact_mobile}
                placeholder="10-digit mobile"
                onChange={e => setForm(f => ({ ...f, contact_mobile: e.target.value }))}
              />
            </div>

            {/* Cold Storage Capacity */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.textSecondary }}>Cold Storage Capacity (kg)</label>
              <input
                type="number"
                min="0"
                className={inp(false)}
                value={form.cold_storage_capacity_kg}
                placeholder="e.g. 5000"
                onChange={e => setForm(f => ({ ...f, cold_storage_capacity_kg: e.target.value }))}
              />
              <p className="mt-1 text-[11px]" style={{ color: T.textMuted }}>Leave blank if not applicable</p>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: T.border }}>
            <button type="button" onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold border transition hover:bg-stone-50"
              style={{ color: T.textSecondary, borderColor: T.border }}>
              Cancel
            </button>
            <button type="submit" disabled={updateLoading}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: T.accent }}>
              {updateLoading
                ? <><FiLoader className="h-4 w-4 animate-spin" /> Saving…</>
                : <><FiCheck className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Listing Component
═══════════════════════════════════════════════════════════ */
export default function CollectionCenterListing() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const list        = useSelector(selectList);
  const listLoading = useSelector(selectListLoading);
  const listError   = useSelector(selectListError);
  const currentPage = useSelector(selectCurrentPage);
  const pageSize    = useSelector(selectPageSize);
  const totalCount  = useSelector(selectTotalCount);

  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("ALL");
  const [editTarget,  setEditTarget]  = useState(null);
  const [viewTarget,  setViewTarget]  = useState(null); // centreId string

  // Fetch on mount and when page changes
  useEffect(() => {
    dispatch(fetchCollectionCenters({ page: currentPage, page_size: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  function handleRefresh() {
    dispatch(fetchCollectionCenters({ page: currentPage, page_size: pageSize }));
  }

  // Client-side filter on fetched page
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter(c => {
      const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchSearch = !q
        || c.centre_id?.toLowerCase().includes(q)
        || c.centre_name?.toLowerCase().includes(q)
        || c.state?.toLowerCase().includes(q)
        || c.district?.toLowerCase().includes(q)
        || c.contact_name?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [list, search, statusFilter]);

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null;

  // Stats
  const activeCount   = list.filter(c => c.status === "ACTIVE").length;
  const inactiveCount = list.filter(c => c.status === "INACTIVE").length;
  const coldCount     = list.filter(c => c.cold_storage_available).length;

  return (
    <div style={{ background: T.pageBg }} className="min-h-full">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MdStorefront className="h-4 w-4" style={{ color: T.accent }} />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: T.textMuted }}>
                Participant Registry
              </p>
            </div>
            <h1 className="text-xl font-bold" style={{ color: T.textPrimary }}>Collection Centres</h1>
            <p className="mt-0.5 text-sm" style={{ color: T.textSecondary }}>
              Manage all registered collection centres
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/participant-registry/collection-center-registration")}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white self-start sm:self-auto"
            style={{ background: T.accent }}>
            <FiPlus className="h-4 w-4" /> Register New Centre
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
          {[
            { label: "Total",    value: list.length,    color: T.accent },
            { label: "Active",   value: activeCount,    color: "#16A34A" },
            { label: "Inactive", value: inactiveCount,  color: "#78716C" },
            { label: "Cold Storage", value: coldCount,  color: "#1D4ED8" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border px-4 py-3"
              style={{ background: T.cardBg, borderColor: T.border }}>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: T.textMuted }}>{s.label}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.textMuted }} />
            <input
              type="text"
              placeholder="Search by ID, name, state…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl pl-10 pr-4 text-sm border outline-none transition-all"
              style={{ background: T.cardBg, borderColor: T.border, color: T.textPrimary }}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 rounded-xl border p-1" style={{ background: T.cardBg, borderColor: T.border }}>
            <FiFilter className="ml-2 h-3.5 w-3.5 shrink-0" style={{ color: T.textMuted }} />
            {["ALL", "ACTIVE", "INACTIVE"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={statusFilter === s
                  ? { background: T.accent, color: "#fff" }
                  : { color: T.textMuted }}>
                {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button onClick={handleRefresh} disabled={listLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border transition hover:bg-stone-100 disabled:opacity-50"
            style={{ borderColor: T.border, background: T.cardBg }}>
            <FiRefreshCw className={`h-4 w-4 ${listLoading ? "animate-spin" : ""}`} style={{ color: T.textMuted }} />
          </button>
        </div>

        {/* ── Error ── */}
        {listError && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 border text-sm"
            style={{ background: T.errorBg, borderColor: T.errorBorder, color: T.errorText }}>
            <FiAlertCircle className="h-4 w-4 shrink-0" />
            {listError}
            <button className="ml-auto" onClick={handleRefresh}>
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Table card ── */}
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: T.cardBg, borderColor: T.border }}>

          {/* Loading overlay */}
          {listLoading && (
            <div className="flex items-center justify-center py-16 gap-3" style={{ color: T.textMuted }}>
              <FiLoader className="h-5 w-5 animate-spin" style={{ color: T.accent }} />
              <span className="text-sm">Loading centres…</span>
            </div>
          )}

          {/* Empty state */}
          {!listLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: T.accentLight }}>
                <MdStorefront className="h-6 w-6" style={{ color: T.accent }} />
              </div>
              <p className="text-sm font-medium" style={{ color: T.textSecondary }}>
                {search || statusFilter !== "ALL" ? "No centres match your filter" : "No centres registered yet"}
              </p>
            </div>
          )}

          {/* Table */}
          {!listLoading && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: T.border, background: "#FAFAF9" }}>
                    {["Centre ID", "Name", "Location", "Contact", "Cold Storage", "Status", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: T.textMuted }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.centre_id}
                      className="border-b transition-colors hover:bg-stone-50/70"
                      style={{ borderColor: i === filtered.length - 1 ? "transparent" : T.border }}>

                      {/* Centre ID */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{ background: T.accentLight, color: T.accent }}>
                          {c.centre_id}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold truncate max-w-[160px]" style={{ color: T.textPrimary }}>{c.centre_name}</p>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-1.5">
                          <FiMapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: T.textMuted }} />
                          <div>
                            <p className="font-medium text-xs" style={{ color: T.textPrimary }}>{c.district}</p>
                            <p className="text-xs" style={{ color: T.textMuted }}>{c.state}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-medium" style={{ color: T.textPrimary }}>{c.contact_name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <FiPhone className="h-3 w-3 shrink-0" style={{ color: T.textMuted }} />
                          <p className="text-xs" style={{ color: T.textMuted }}>{c.contact_mobile}</p>
                        </div>
                      </td>

                      {/* Cold storage */}
                      <td className="px-4 py-3.5">
                        <ColdBadge value={c.cold_storage_available} />
                        {c.cold_storage_capacity_kg && (
                          <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{c.cold_storage_capacity_kg} kg</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewTarget(c.centre_id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-blue-50"
                            style={{ borderColor: T.border }}
                            title="View details">
                            <FiEye className="h-3.5 w-3.5" style={{ color: "#1D4ED8" }} />
                          </button>
                          <button
                            onClick={() => setEditTarget(c)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition hover:bg-stone-100"
                            style={{ borderColor: T.border, color: T.textSecondary }}>
                            <FiEdit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination footer */}
          {!listLoading && list.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t"
              style={{ borderColor: T.border, background: "#FAFAF9" }}>
              <p className="text-xs" style={{ color: T.textMuted }}>
                Showing <span className="font-semibold" style={{ color: T.textPrimary }}>{filtered.length}</span> of{" "}
                <span className="font-semibold" style={{ color: T.textPrimary }}>{totalCount ?? list.length}</span> centres
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(setPage(currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-stone-100 disabled:opacity-40"
                  style={{ borderColor: T.border }}>
                  <FiChevronLeft className="h-4 w-4" style={{ color: T.textSecondary }} />
                </button>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: T.border, color: T.textPrimary }}>
                  Page {currentPage}{totalPages ? ` / ${totalPages}` : ""}
                </span>
                <button
                  onClick={() => dispatch(setPage(currentPage + 1))}
                  disabled={totalPages ? currentPage >= totalPages : list.length < pageSize}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-stone-100 disabled:opacity-40"
                  style={{ borderColor: T.border }}>
                  <FiChevronRight className="h-4 w-4" style={{ color: T.textSecondary }} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── View Modal ── */}
      {viewTarget && (
        <ViewModal
          centreId={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <EditModal
          centre={editTarget}
          onClose={() => { setEditTarget(null); dispatch(resetUpdate()); }}
        />
      )}
    </div>
  );
}
