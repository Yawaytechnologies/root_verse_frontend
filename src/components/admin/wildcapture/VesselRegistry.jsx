// src/components/admin/wildcapture/VesselRegistry.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiRefreshCcw,
  FiAlertTriangle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiX,
} from "react-icons/fi";

import { fetchVessels, updateVessel } from "../../../redux/action/vesselActions";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["PENDING", "APPROVED"];

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

function StatusSelect({ value, disabled, onChange, className = "" }) {
  const v = String(value || "PENDING").toUpperCase();
  const safe = STATUS_OPTIONS.includes(v) ? v : "PENDING";

  return (
    <select
      value={safe}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "h-9 w-[120px] rounded-xl border pl-2 pr-6 text-xs font-extrabold outline-none",
        "border-emerald-200 bg-white text-slate-900",
        "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-50/40",
        className,
      ].join(" ")}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function StatusPill({ value, className = "" }) {
  const v = String(value || "PENDING").toUpperCase();

  const tone =
    v === "APPROVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : v === "PENDING"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div
      className={[
        "inline-flex h-9 min-w-[110px] items-center justify-center rounded-xl border px-3 text-xs font-extrabold",
        tone,
        className,
      ].join(" ")}
    >
      {v}
    </div>
  );
}

function SectionHeader({ title, count, page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
            {count}
          </span>
        </div>
        <div className="mt-1 text-xs font-semibold text-slate-500">
          Page <span className="text-slate-800">{page}</span> /{" "}
          <span className="text-slate-800">{totalPages}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
        >
          <FiChevronLeft className="h-4 w-4" />
          Prev
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
        >
          Next
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-full w-full overflow-y-auto p-3 sm:p-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-emerald-100 bg-white px-5 py-4">
              <div className="text-base font-extrabold text-slate-900">
                {title}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-white hover:bg-emerald-50"
              >
                <FiX className="h-4 w-4 text-emerald-800" />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900 break-words">
        {value}
      </div>
    </div>
  );
}

export default function VesselRegistry() {
  const dispatch = useDispatch();

  const { list = [], loading = false, error = null, updatingById = {} } =
    useSelector((s) => s.vessel);

  const [q, setQ] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [openView, setOpenView] = useState(false);
  const [active, setActive] = useState(null);
  const [statusOverride, setStatusOverride] = useState({});

  useEffect(() => {
    dispatch(fetchVessels());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const searched = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((v) => {
      const hay = [
        v.rv_vessel_id, v.vessel_name, v.govt_registration_number,
        v.home_port, v.vessel_type, v.local_identifier, v.owner_id, v.fuel_type,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q]);

  const pendingRows = useMemo(() =>
    searched.filter((v) => String(v.approval_status || "").toUpperCase() === "PENDING"),
    [searched]);

  const approvedRows = useMemo(() =>
    searched.filter((v) => String(v.approval_status || "").toUpperCase() === "APPROVED"),
    [searched]);

  const pendingTotalPages = Math.max(1, Math.ceil(pendingRows.length / PAGE_SIZE));
  const approvedTotalPages = Math.max(1, Math.ceil(approvedRows.length / PAGE_SIZE));

  useEffect(() => { setPendingPage(1); setApprovedPage(1); }, [q]);

  useEffect(() => {
    if (pendingPage > pendingTotalPages) setPendingPage(pendingTotalPages);
    if (pendingPage < 1) setPendingPage(1);
  }, [pendingPage, pendingTotalPages]);

  useEffect(() => {
    if (approvedPage > approvedTotalPages) setApprovedPage(approvedTotalPages);
    if (approvedPage < 1) setApprovedPage(1);
  }, [approvedPage, approvedTotalPages]);

  const pendingPaged = useMemo(() => {
    const start = (pendingPage - 1) * PAGE_SIZE;
    return pendingRows.slice(start, start + PAGE_SIZE);
  }, [pendingRows, pendingPage]);

  const approvedPaged = useMemo(() => {
    const start = (approvedPage - 1) * PAGE_SIZE;
    return approvedRows.slice(start, start + PAGE_SIZE);
  }, [approvedRows, approvedPage]);

  const openDetails = (v) => { setActive(v); setOpenView(true); };
  const closeDetails = () => { setOpenView(false); setActive(null); };

  const getDisplayStatus = (v) => {
    const over = statusOverride[v.id];
    return (over || v.approval_status || "PENDING").toUpperCase();
  };

  const changeStatus = async (v, nextStatus) => {
    const current = String(v.approval_status || "PENDING").toUpperCase();
    const next = String(nextStatus || "PENDING").toUpperCase();
    if (!STATUS_OPTIONS.includes(next) || current === next) return;

    const ok = window.confirm(
      `Change status for "${v.vessel_name || v.rv_vessel_id || v.id}" from ${current} to ${next}?`
    );
    if (!ok) { setStatusOverride((p) => ({ ...p, [v.id]: current })); return; }

    setStatusOverride((p) => ({ ...p, [v.id]: next }));
    const res = await dispatch(updateVessel({ id: v.id, payload: { approval_status: next } }));
    if (res?.meta?.requestStatus === "rejected") {
      setStatusOverride((p) => ({ ...p, [v.id]: current }));
      return;
    }
    await dispatch(fetchVessels());
  };

  // ✅ KEY FIX: overflow-x-auto here, and tighter px-3 on cells
  const RenderDesktopTable = ({ data, statusMode = "editable" }) => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full min-w-[680px] table-fixed">
        <colgroup>
          <col className="w-[32%]" />
          <col className="w-[16%]" />
          <col className="w-[24%]" />
          <col className="w-[16%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead className="bg-emerald-50/60">
          <tr className="text-left text-xs font-extrabold uppercase tracking-wider text-emerald-900/70">
            <th className="px-3 py-4">Vessel</th>
            <th className="px-3 py-4">Govt Reg No</th>
            <th className="px-3 py-4">Home Port</th>
            <th className="px-3 py-4">Status</th>
            <th className="px-3 py-4 text-right">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-emerald-100">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">Loading...</td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">No vessels found.</td>
            </tr>
          ) : (
            data.map((v) => {
              const isUpdating = !!updatingById?.[v.id];
              const displayStatus = getDisplayStatus(v);
              return (
                <tr key={v.id} className="hover:bg-emerald-50/30">
                  <td className="px-3 py-4">
                    <div className="truncate text-sm font-extrabold text-slate-900">
                      {v.vessel_name || "—"}
                    </div>
                    <div className="truncate text-[11px] text-slate-500">
                      {v.rv_vessel_id || `ID: ${v.id}`}
                      {v.local_identifier ? ` • Local: ${v.local_identifier}` : ""}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      {v.govt_registration_number || "—"}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      {v.home_port || "—"}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    {statusMode === "readonly" ? (
                      <StatusPill value={displayStatus} />
                    ) : (
                      <StatusSelect
                        value={displayStatus}
                        disabled={isUpdating}
                        onChange={(next) => changeStatus(v, next)}
                      />
                    )}
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => openDetails(v)}
                        className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
                      >
                        <FiEye className="h-4 w-4" />
                        View
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
  );

  const RenderMobileCards = ({ data, statusMode = "editable" }) => (
    <div className="lg:hidden divide-y divide-emerald-100">
      {loading ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
      ) : data.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">No vessels found.</div>
      ) : (
        data.map((v) => {
          const isUpdating = !!updatingById?.[v.id];
          const displayStatus = getDisplayStatus(v);
          return (
            <div key={v.id} className="p-4">
              <div className="truncate text-base font-extrabold text-slate-900">{v.vessel_name || "—"}</div>
              <div className="mt-1 text-[11px] text-slate-500 truncate">
                {v.rv_vessel_id || `ID: ${v.id}`}
                {v.govt_registration_number ? ` • Reg: ${v.govt_registration_number}` : ""}
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800 truncate">{v.home_port || "—"}</div>
              <div className="mt-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Status</div>
                <div className="mt-2">
                  {statusMode === "readonly" ? (
                    <StatusPill className="w-full" value={displayStatus} />
                  ) : (
                    <StatusSelect className="w-full" value={displayStatus} disabled={isUpdating} onChange={(next) => changeStatus(v, next)} />
                  )}
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => openDetails(v)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
                >
                  <FiEye className="h-4 w-4" /> View Details
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // ✅ KEY FIX: removed overflow-hidden from section wrappers — it was blocking inner scroll
  const SectionCard = ({ children }) => (
    <div className="mt-5 rounded-3xl border border-emerald-100 bg-white shadow-sm">
      {children}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      {/* Top header */}
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white">
              Wild Capture • Vessels
            </div>
            <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Vessel Approval
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Status dropdown supports only <b>PENDING</b> / <b>APPROVED</b>. Type moved to View popup.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(fetchVessels())}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-extrabold text-emerald-800 hover:bg-emerald-50"
          >
            <FiRefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 sm:max-w-xl">
          <FiSearch className="h-4 w-4 text-emerald-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vessel / reg no / port / type / owner…"
            className="h-10 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
          />
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <FiAlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* PENDING SECTION */}
      <SectionCard>
        <div className="p-4 sm:p-5 border-b border-emerald-100 bg-emerald-50/30 rounded-t-3xl">
          <SectionHeader
            title="Pending Vessels"
            count={pendingRows.length}
            page={pendingPage}
            totalPages={pendingTotalPages}
            onPrev={() => setPendingPage((p) => Math.max(1, p - 1))}
            onNext={() => setPendingPage((p) => Math.min(pendingTotalPages, p + 1))}
          />
        </div>
        <RenderDesktopTable data={pendingPaged} statusMode="editable" />
        <RenderMobileCards data={pendingPaged} statusMode="editable" />
        <div className="border-t border-emerald-100 bg-white px-4 py-3 rounded-b-3xl">
          <div className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {pendingRows.length === 0 ? 0 : (pendingPage - 1) * PAGE_SIZE + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(pendingPage * PAGE_SIZE, pendingRows.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{pendingRows.length}</span>
          </div>
        </div>
      </SectionCard>

      {/* APPROVED SECTION */}
      <SectionCard>
        <div className="p-4 sm:p-5 border-b border-emerald-100 bg-emerald-50/30 rounded-t-3xl">
          <SectionHeader
            title="Approved Vessels"
            count={approvedRows.length}
            page={approvedPage}
            totalPages={approvedTotalPages}
            onPrev={() => setApprovedPage((p) => Math.max(1, p - 1))}
            onNext={() => setApprovedPage((p) => Math.min(approvedTotalPages, p + 1))}
          />
        </div>
        <RenderDesktopTable data={approvedPaged} statusMode="readonly" />
        <RenderMobileCards data={approvedPaged} statusMode="readonly" />
        <div className="border-t border-emerald-100 bg-white px-4 py-3 rounded-b-3xl">
          <div className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {approvedRows.length === 0 ? 0 : (approvedPage - 1) * PAGE_SIZE + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-slate-900">
              {Math.min(approvedPage * PAGE_SIZE, approvedRows.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">{approvedRows.length}</span>
          </div>
        </div>
      </SectionCard>

      {/* VIEW POPUP */}
      {openView && active && (
        <ModalShell title="Vessel Details" onClose={closeDetails}>
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div className="text-lg font-extrabold text-slate-900 truncate">{active.vessel_name || "—"}</div>
              <div className="mt-1 text-sm text-slate-600">
                {active.rv_vessel_id || `ID: ${active.id}`} •{" "}
                <span className="font-semibold text-slate-900">
                  {String(active.approval_status || "PENDING").toUpperCase()}
                </span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard label="Govt Registration No" value={active.govt_registration_number || "—"} />
              <InfoCard label="Home Port" value={active.home_port || "—"} />
              <InfoCard label="Vessel Type" value={active.vessel_type || "—"} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard label="Local Identifier" value={active.local_identifier || "—"} />
              <InfoCard label="Owner ID" value={active.owner_id ?? "—"} />
              <InfoCard label="Fishing License No" value={active.fishing_license_no || "—"} />
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <InfoCard label="Crew Capacity Max" value={active.crew_capacity_max ?? "—"} />
              <InfoCard label="Storage Capacity (KG)" value={active.storage_capacity_kg ?? "—"} />
              <InfoCard label="Engine Power (HP)" value={active.engine_power_hp ?? "—"} />
              <InfoCard label="Fuel Type" value={active.fuel_type || "—"} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard label="Created At" value={fmtDate(active.created_at)} />
              <InfoCard label="Updated At" value={fmtDate(active.updated_at)} />
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}