import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiRefreshCcw, FiAlertTriangle, FiSearch, FiChevronRight } from "react-icons/fi";

import { fetchTripsByStatus, clearApproveError } from "../../../redux/reducer/tripapprovalSlice";
import { approveTrip } from "../../../redux/action/tripapprovalActions";

const UI_FONT = "'Segoe UI', Tahoma, Arial, system-ui, -apple-system, sans-serif";
const cx = (...a) => a.filter(Boolean).join(" ");

function ApprovalSelect({ value, disabled, onApprove }) {
  const v = String(value || "pending").toLowerCase();
  const isApproved = v === "approved";

  return (
    <select
      className={cx(
        "h-9 w-full min-w-[150px] rounded-xl border px-3 text-sm font-medium capitalize",
        "bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200",
        isApproved
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-900"
      )}
      value={v}
      onChange={(e) => e.target.value === "approved" && onApprove()}
      disabled={disabled || isApproved}
    >
      <option value="pending">pending</option>
      <option value="approved">approved</option>
    </select>
  );
}

function Section({ title, total, loading, error, emptyText, children }) {
  return (
    <div className="px-4 sm:px-6 py-5 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">
          Total: <span className="font-semibold text-slate-900">{total}</span>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-start gap-2">
          <FiAlertTriangle className="mt-0.5" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Loading…
        </div>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function TripsTable({ rows, mode, approvingById, approveErrorById, onApprove }) {
  const isPending = mode === "pending";

  const th =
    "px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600";
  const td = "px-6 py-4 align-middle text-sm text-slate-800";

  return (
    <>
      {/* desktop */}
      <div className="hidden md:block">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* IMPORTANT: do NOT use overflow-hidden here */}
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed">
              {/* COL CONTROL (premium + prevents right side collapse) */}
              <colgroup>
                <col style={{ width: "240px" }} /> {/* Trip */}
                <col style={{ width: "140px" }} /> {/* Owner */}
                <col /> {/* Location (flex) */}
                <col style={{ width: "190px" }} /> {/* Approval */}
                <col style={{ width: "150px" }} /> {/* Action */}
              </colgroup>

              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Trip</th>
                  <th className={th}>Owner Code</th>
                  <th className={th}>Location</th>
                  <th className={th}>Approval</th>
                  <th className={cx(th, "text-right pr-8")}>Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {rows.map((t) => {
                  const approving = !!approvingById?.[t.id];
                  const err = approveErrorById?.[t.id];

                  const tripCode = t?.trip_id || `Trip #${t?.id}`;
                  const owner = t?.owner_code || "—";
                  const loc = t?.near_station || t?.location_name || "—";
                  const approval = String(t?.approval_status || "pending").toLowerCase();

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className={td}>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900">{tripCode}</div>
                          {err && <div className="mt-1 text-[12px] text-rose-700 truncate">{err}</div>}
                        </div>
                      </td>

                      <td className={td}>
                        <div className="truncate font-semibold text-slate-900">{owner}</div>
                      </td>

                      <td className={td}>
                        {/* Location must not expand table */}
                        <div className="min-w-0 truncate text-slate-700" title={loc}>
                          {loc}
                        </div>
                      </td>

                      <td className={td}>
                        <div className="min-w-[150px]">
                          {isPending ? (
                            <ApprovalSelect
                              value={approval}
                              disabled={approving || approval === "approved"}
                              onApprove={() => onApprove(t)}
                            />
                          ) : (
                            <ApprovalSelect value="approved" disabled onApprove={() => {}} />
                          )}
                        </div>
                      </td>

                      <td className={cx(td, "text-right pr-8")}>
                        <Link
                          to={`/admin/wild-capture/trip-approval/${t.id}`}
                          className="inline-flex h-9 w-[120px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
                        >
                          Details <FiChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* mobile */}
      <div className="md:hidden space-y-3">
        {rows.map((t) => {
          const approving = !!approvingById?.[t.id];
          const err = approveErrorById?.[t.id];

          const tripCode = t?.trip_id || `Trip #${t?.id}`;
          const owner = t?.owner_code || "—";
          const loc = t?.near_station || t?.location_name || "—";
          const approval = String(t?.approval_status || "pending").toLowerCase();

          return (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{tripCode}</div>
                  <div className="mt-1 text-[12px] text-slate-600">
                    Owner: <span className="font-semibold text-slate-900">{owner}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-600 truncate">
                    Location: <span className="font-medium text-slate-700">{loc}</span>
                  </div>
                  {err && <div className="mt-2 text-[12px] text-rose-700">{err}</div>}
                </div>

                <Link
                  to={`/admin/wild-capture/trip-approval/${t.id}`}
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  Details <FiChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-3">
                {isPending ? (
                  <ApprovalSelect
                    value={approval}
                    disabled={approving || approval === "approved"}
                    onApprove={() => onApprove(t)}
                  />
                ) : (
                  <ApprovalSelect value="approved" disabled onApprove={() => {}} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function TripApproval() {
  const dispatch = useDispatch();

  const {
    pending = [],
    approved = [],
    loadingPending,
    loadingApproved,
    errorPending,
    errorApproved,
    approvingById = {},
    approveErrorById = {},
  } = useSelector((s) => s.trip);

  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(fetchTripsByStatus({ status: "pending" }));
    dispatch(fetchTripsByStatus({ status: "approved" }));
  }, [dispatch]);

  const refresh = () => {
    dispatch(fetchTripsByStatus({ status: "pending" }));
    dispatch(fetchTripsByStatus({ status: "approved" }));
  };

  const filterTrips = (arr) => {
    const q = query.trim().toLowerCase();
    if (!q) return Array.isArray(arr) ? arr : [];
    return (arr || []).filter((t) => {
      const tripCode = String(t?.trip_id || "").toLowerCase();
      const ownerCode = String(t?.owner_code || "").toLowerCase();
      const loc = String(t?.near_station || t?.location_name || "").toLowerCase();
      return tripCode.includes(q) || ownerCode.includes(q) || loc.includes(q);
    });
  };

  const pendingRows = useMemo(() => filterTrips(pending), [pending, query]);
  const approvedRows = useMemo(() => filterTrips(approved), [approved, query]);

  const tryApprove = async (trip) => {
    if (!trip?.id) return;
    if (String(trip?.approval_status || "").toLowerCase() === "approved") return;
    dispatch(clearApproveError(trip.id));
    await dispatch(approveTrip({ id: trip.id }));
  };

  return (
    <div className="w-full" style={{ fontFamily: UI_FONT, fontWeight: 400 }}>
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
        {/* header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-4 sm:px-6 border-b border-slate-200">
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900">Trip Approval</div>
            <div className="text-xs text-slate-500">
              Pending: <span className="font-semibold text-slate-900">{pendingRows.length}</span>
              <span className="mx-2 text-slate-300">•</span>
              Approved: <span className="font-semibold text-slate-900">{approvedRows.length}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trips..."
                className="h-10 w-full sm:w-80 rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <FiRefreshCcw className={`h-4 w-4 ${(loadingPending || loadingApproved) ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <Section
          title="Pending Trips"
          total={pendingRows.length}
          loading={loadingPending}
          error={errorPending}
          emptyText="No pending trips."
        >
          <TripsTable
            rows={pendingRows}
            mode="pending"
            approvingById={approvingById}
            approveErrorById={approveErrorById}
            onApprove={tryApprove}
          />
        </Section>

        <Section
          title="Approved Trips"
          total={approvedRows.length}
          loading={loadingApproved}
          error={errorApproved}
          emptyText="No approved trips."
        >
          <TripsTable
            rows={approvedRows}
            mode="approved"
            approvingById={approvingById}
            approveErrorById={approveErrorById}
            onApprove={() => {}}
          />
        </Section>
      </div>
    </div>
  );
}
