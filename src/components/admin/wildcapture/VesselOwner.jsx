import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiEye, FiX, FiRefreshCcw, FiAlertTriangle } from "react-icons/fi";

import {
  getWildCaptureOwners,
  updateOwnerVerification,
} from "../../../redux/action/vesselownerActions";
import { clearUpdateError } from "../../../redux/reducer/vesselownerSlice";

const MAX_FILE_MB = 10;
const ACCEPT = "image/jpeg,application/pdf";

// ✅ Pagination
const PAGE_SIZE = 10;

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

function normStatus(v) {
  const s = String(v || "PENDING").trim().toUpperCase();
  return s === "VERIFIED" ? "VERIFIED" : "PENDING";
}

function clampPage(p, totalPages) {
  const tp = Math.max(1, totalPages || 1);
  return Math.min(Math.max(1, p || 1), tp);
}

function paginate(items, page) {
  const p = Math.max(1, page || 1);
  const start = (p - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
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

function Pager({ page, totalPages, totalItems, onPrev, onNext }) {
  const tp = Math.max(1, totalPages || 1);
  const p = clampPage(page, tp);

  const start = totalItems === 0 ? 0 : (p - 1) * PAGE_SIZE + 1;
  const end = Math.min(p * PAGE_SIZE, totalItems);

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block text-[12px] text-slate-500">
        {totalItems === 0 ? "No records" : `Showing ${start}-${end} of ${totalItems}`}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={p <= 1}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white"
        >
          Prev
        </button>

        <div className="min-w-[84px] text-center text-xs font-semibold text-slate-700">
          {p} / {tp}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={p >= tp}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const s = normStatus(value);
  const isV = s === "VERIFIED";
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold",
        isV
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-700",
      ].join(" ")}
    >
      {isV ? "Verified" : "Pending"}
    </span>
  );
}

/**
 * ✅ Section supports "readonlyStatus"
 * - Pending: readonlyStatus = false => dropdown shown
 * - Verified: readonlyStatus = true  => badge shown (no dropdown)
 */
function Section({
  title,
  rows,
  loading,
  page,
  setPage,
  onRefresh,
  onView,
  onStatusChange,
  readonlyStatus = false,
  forcedStatus = null, // when readonly, you can force display
}) {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = clampPage(page, totalPages);
  const pageRows = useMemo(() => paginate(rows, safePage), [rows, safePage]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const next = clampPage(page, tp);
    if (next !== page) setPage(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-b border-slate-200">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            Total: <span className="font-semibold text-slate-900">{totalItems}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Pager
            page={safePage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPrev={() => setPage((p) => clampPage((p || 1) - 1, totalPages))}
            onNext={() => setPage((p) => clampPage((p || 1) + 1, totalPages))}
          />

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            <FiRefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ✅ MOBILE (cards) */}
      <div className="md:hidden">
        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
        ) : pageRows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">No owners found.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pageRows.map((u) => (
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
                      <div className="truncate text-sm font-semibold text-slate-900">{u.username}</div>
                      <div className="truncate text-[12px] text-slate-500">
                        {u.phone_no} • {u.address}
                      </div>
                      <div className="truncate text-[12px] text-slate-500 mt-0.5">
                        {u.state_name} • {u.district_name}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onView(u)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                    aria-label="View"
                    title="View"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  {readonlyStatus ? (
                    <StatusBadge value={forcedStatus || u.verification_status} />
                  ) : (
                    <select
                      value={(u.verification_status || "PENDING").toUpperCase()}
                      onChange={(e) => onStatusChange(u, e.target.value)}
                      className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="VERIFIED">Verified</option>
                    </select>
                  )}

                  <span className="text-[11px] text-slate-500">
                    {u.updated_at ? `Updated: ${fmtDate(u.updated_at)}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ DESKTOP (table) */}
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
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                  No owners found.
                </td>
              </tr>
            ) : (
              pageRows.map((u) => (
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
                        <div className="truncate text-sm font-semibold text-slate-900">{u.username}</div>
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
                    {readonlyStatus ? (
                      <StatusBadge value={forcedStatus || u.verification_status} />
                    ) : (
                      <select
                        value={(u.verification_status || "PENDING").toUpperCase()}
                        onChange={(e) => onStatusChange(u, e.target.value)}
                        className="block rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="VERIFIED">Verified</option>
                      </select>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(u)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                        aria-label="View"
                        title="View"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OwnerDetailsTable() {
  const dispatch = useDispatch();

  // ✅ store key = owner
  const {
    list = [],
    loading = false,
    error = null,
    updatingById = {},
    updateErrorById = {},
  } = useSelector((s) => s.owner);

  const [openView, setOpenView] = useState(false);
  const [active, setActive] = useState(null);

  const [form, setForm] = useState({
    username: "",
    phone_no: "",
    address: "",
    state_name: "",
    district_name: "",
    aadhar_number: "",
    pan_number: "",
    govt_id: "",
    aadhar: null,
    pan: null,
    govt: null,
  });

  // ✅ separate pagination state per table
  const [pendingPage, setPendingPage] = useState(1);
  const [verifiedPage, setVerifiedPage] = useState(1);

  useEffect(() => {
    dispatch(getWildCaptureOwners());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const pendingRows = useMemo(
    () => rows.filter((u) => normStatus(u.verification_status) === "PENDING"),
    [rows]
  );

  const verifiedRows = useMemo(
    () => rows.filter((u) => normStatus(u.verification_status) === "VERIFIED"),
    [rows]
  );

  const openViewModal = (u) => {
    setActive(u);
    setOpenView(true);
  };

  const closeAll = () => {
    setOpenView(false);
    setActive(null);
  };

  const onRefresh = () => dispatch(getWildCaptureOwners());

  // ✅ Only allow status changes from Pending table (UI), but function is generic.
  const onStatusChange = (u, vRaw) => {
    const v = String(vRaw || "").toUpperCase();
    dispatch(
      updateOwnerVerification({
        ownerId: u.id,
        payload: { verification_status: v },
      })
    );
  };

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
          onClick={onRefresh}
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

      <div className="p-4 space-y-4">
        {/* ✅ Pending table: dropdown allowed */}
        <Section
          title="Pending Owners"
          rows={pendingRows}
          loading={loading}
          page={pendingPage}
          setPage={setPendingPage}
          onRefresh={onRefresh}
          onView={openViewModal}
          onStatusChange={onStatusChange}
          readonlyStatus={false}
        />

        {/* ✅ Verified table: NO DROPDOWN, fixed status display */}
        <Section
          title="Verified Owners"
          rows={verifiedRows}
          loading={loading}
          page={verifiedPage}
          setPage={setVerifiedPage}
          onRefresh={onRefresh}
          onView={openViewModal}
          onStatusChange={onStatusChange}
          readonlyStatus={true}
          forcedStatus="VERIFIED"
        />
      </div>

      {/* ✅ VIEW MODAL */}
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
            </div>

            <div className="border-t border-slate-200 px-4 py-3 flex justify-end" />
          </div>
        </div>
      )}
    </div>
  );
}
