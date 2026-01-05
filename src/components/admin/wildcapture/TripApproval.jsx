import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiEye, FiRefreshCcw, FiAlertTriangle, FiX } from "react-icons/fi";
import { getTrips, approveTrip } from "../../../redux/action/tripapprovalActions";
import { clearApproveError } from "../../../redux/reducer/tripapprovalSlice";

function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

function money(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const isApproved = s === "approved";
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        isApproved
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-800",
      ].join(" ")}
    >
      {status || "pending"}
    </span>
  );
}

export default function TripApprovalTable() {
  const dispatch = useDispatch();
  const { list = [], loading, error, approvingById = {}, approveErrorById = {} } =
    useSelector((s) => s.trip);

  const [openView, setOpenView] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    dispatch(getTrips());
  }, [dispatch]);

  const rows = useMemo(() => (Array.isArray(list) ? list : []), [list]);

  const openModal = (trip) => {
    setActive(trip);
    setOpenView(true);
  };

  const closeModal = () => {
    setOpenView(false);
    setActive(null);
  };

  const tryApprove = async (trip) => {
    if (!trip?.id) return;
    if ((trip.approval_status || "").toLowerCase() === "approved") return;

    dispatch(clearApproveError(trip.id));
    await dispatch(approveTrip({ id: trip.id }));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start sm:items-center justify-between gap-3 px-4 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Trip Approval</h2>
          <p className="text-xs text-slate-500">
            Total: <span className="font-semibold text-slate-900">{rows.length}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(getTrips())}
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

      {/* ✅ MOBILE: cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">No trips found.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {rows.map((t) => {
              const approving = !!approvingById[t.id];
              const err = approveErrorById?.[t.id];

              return (
                <div key={t.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {t.trip_id} • {t.owner_code}
                      </div>
                      <div className="truncate text-[12px] text-slate-500 mt-0.5">
                        {t.near_station} • {t.fishing_method}
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5">
                        Planned: <span className="font-medium">{fmtDate(t.planned_at)}</span>
                      </div>
                      <div className="text-[12px] text-slate-500">
                        Arrival: <span className="font-medium">{fmtDate(t.arrival_at)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openModal(t)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 shrink-0"
                      aria-label="View"
                      title="View"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <StatusPill status={t.approval_status} />

                    <select
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800"
                      value={(t.approval_status || "pending").toLowerCase()}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === "approved") tryApprove(t);
                      }}
                      disabled={approving || (t.approval_status || "").toLowerCase() === "approved"}
                      title="Change status"
                    >
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                    </select>
                  </div>

                  {err && (
                    <div className="mt-2 text-[12px] text-rose-700">{err}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ DESKTOP: table (md+) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-slate-100">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th className="px-4 py-3 w-[22%]">Trip</th>
              <th className="px-4 py-3 w-[16%]">Station</th>
              <th className="px-4 py-3 w-[12%]">Method</th>
              <th className="px-4 py-3 w-[16%]">Planned</th>
              <th className="px-4 py-3 w-[12%]">Arrival</th>
              <th className="px-4 py-3 w-[8%]">QR</th>
              <th className="px-4 py-3 w-[10%]">Status</th>
              <th className="px-4 py-3 w-[4%] text-right">View</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                  No trips found.
                </td>
              </tr>
            ) : (
              rows.map((t) => {
                const approving = !!approvingById[t.id];
                const err = approveErrorById?.[t.id];
                const isApproved = (t.approval_status || "").toLowerCase() === "approved";

                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {t.trip_id}
                      </div>
                      <div className="text-[12px] text-slate-500 truncate">
                        Owner: <span className="font-medium">{t.owner_code}</span>
                      </div>
                      {err && <div className="text-[12px] text-rose-700 mt-1">{err}</div>}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-700 truncate">{t.near_station}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 truncate">{t.fishing_method}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{fmtDate(t.planned_at)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{fmtDate(t.arrival_at)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{t.qr_count ?? "—"}</td>

                    {/* ✅ status dropdown triggers PUT */}
                    <td className="px-4 py-3">
                      <select
                        className={[
                          "h-9 w-full rounded-xl border px-3 text-xs font-semibold",
                          isApproved
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-amber-200 bg-amber-50 text-amber-900",
                        ].join(" ")}
                        value={(t.approval_status || "pending").toLowerCase()}
                        onChange={(e) => {
                          const next = e.target.value;
                          if (next === "approved") tryApprove(t);
                        }}
                        disabled={approving || isApproved}
                        title="Change status"
                      >
                        <option value="pending">pending</option>
                        <option value="approved">approved</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => openModal(t)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                          aria-label="View"
                          title="View"
                        >
                          <FiEye className="h-4 w-4" />
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

      {/* ✅ VIEW MODAL */}
      {openView && active && (
        <div className="fixed inset-0 z-50 bg-black/40 p-3 sm:p-4">
          <div className="mx-auto flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Trip Details</div>
                <div className="text-xs text-slate-500">
                  Trip: <span className="font-semibold">{active.trip_id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Box label="Owner Code" value={active.owner_code} />
                <Box label="Station" value={active.near_station} />
                <Box label="Method" value={active.fishing_method} />
                <Box label="Planned At" value={fmtDate(active.planned_at)} />
                <Box label="Arrival At" value={fmtDate(active.arrival_at)} />
                <Box label="Approval" value={<StatusPill status={active.approval_status} />} />
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Box label="Diesel" value={money(active.diesel)} />
                <Box label="Ice" value={money(active.ice)} />
                <Box label="QR Count" value={active.qr_count ?? "—"} />
                <Box label="Total" value={money(active.total)} />
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <Box label="Created" value={fmtDate(active.created_at)} />
                <Box label="Updated" value={fmtDate(active.updated_at)} />
              </div>
            </div>

            <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Changing status to <span className="font-semibold">approved</span> calls:{" "}
                <span className="font-semibold">PUT /api/trip/{active.id}/approve</span>
              </div>

              <button
                type="button"
                onClick={() => tryApprove(active)}
                disabled={(active.approval_status || "").toLowerCase() === "approved" || !!approvingById[active.id]}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold text-white",
                  (active.approval_status || "").toLowerCase() === "approved"
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-slate-800",
                ].join(" ")}
              >
                {(active.approval_status || "").toLowerCase() === "approved"
                  ? "Approved"
                  : approvingById[active.id]
                  ? "Approving..."
                  : "Approve Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Box({ label, value }) {
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
