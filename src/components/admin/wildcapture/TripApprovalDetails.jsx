import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useLocation } from "react-router-dom";
import { FiAlertTriangle, FiChevronLeft, FiRefreshCcw } from "react-icons/fi";

import { fetchTripDetails, fetchCatchlogsForTrip } from "../../../redux/reducer/tripapprovalSlice";

const UI_FONT = "'Segoe UI', Tahoma, Arial, system-ui, -apple-system, sans-serif";

function safeImg(url) {
  if (!url) return "";
  return String(url).replace(/%22/g, "").replace(/"/g, "");
}

function num(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function fmtMoney(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateParts(v) {
  if (!v) return { date: "—", time: "" };
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return { date: String(v), time: "" };
  const date = d.toLocaleDateString("en-GB");
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

// ✅ handles: trip, {data: trip}, {data: [trip]}, {success:true,data:...}
function normalizeTrip(t) {
  if (!t) return null;
  if (t?.data) {
    if (Array.isArray(t.data)) return t.data[0] || null;
    if (typeof t.data === "object") return t.data;
  }
  return t;
}

export default function TripApprovalDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const pending = useSelector((s) => s.trip.pending || []);
  const approved = useSelector((s) => s.trip.approved || []);

  const rawDetails = useSelector((s) => s.trip.tripDetailsById?.[id] || null);
  const tripLoading = useSelector((s) => !!s.trip.tripDetailsLoadingById?.[id]);
  const tripError = useSelector((s) => s.trip.tripDetailsErrorById?.[id] || null);

  const tripFromLinkState = state?.trip || null;

  const tripFromList = useMemo(() => {
    const all = [...pending, ...approved];
    return all.find((t) => String(t?.id) === String(id)) || null;
  }, [pending, approved, id]);

  // ✅ normalized trip (fixes wrong-level rendering)
  const trip = useMemo(() => {
    return normalizeTrip(rawDetails) || normalizeTrip(tripFromLinkState) || normalizeTrip(tripFromList);
  }, [rawDetails, tripFromLinkState, tripFromList]);

  const catchlogs = useSelector((s) => s.trip.catchlogsByTripId?.[id] || []);
  const clLoading = useSelector((s) => !!s.trip.catchlogsLoadingByTripId?.[id]);
  const clError = useSelector((s) => s.trip.catchlogsErrorByTripId?.[id] || null);
  const qcFilterFromStore = useSelector((s) => s.trip.catchlogsQcFilterByTripId?.[id] || "all");

  const [qcFilter, setQcFilter] = useState(qcFilterFromStore || "all");

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTripDetails({ id }));
    dispatch(fetchCatchlogsForTrip({ tripId: id, qcStatus: "all" }));
  }, [dispatch, id]);

  useEffect(() => {
    setQcFilter(qcFilterFromStore || "all");
  }, [qcFilterFromStore]);

  const refresh = () => {
    dispatch(fetchTripDetails({ id }));
    dispatch(fetchCatchlogsForTrip({ tripId: id, qcStatus: qcFilter || "all" }));
  };

  const totalWeight = useMemo(() => {
    return (catchlogs || []).reduce((sum, c) => sum + (num(c?.weight) || 0), 0);
  }, [catchlogs]);

  const created = dateParts(trip?.created_at);
  const updated = dateParts(trip?.updated_at);

  const showNotFound = !!tripError && !trip;

  // ✅ safe fields (works for both list fallback + details response)
  const location = trip?.location_name ?? trip?.near_station ?? "—";

  return (
    <div className="w-full" style={{ fontFamily: UI_FONT, fontWeight: 400 }}>
      {/* IMPORTANT: no overflow-hidden here */}
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
        {/* top bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-4 sm:px-6 border-b border-slate-200">
          <div className="min-w-0">
            <Link
              to="/admin/wild-capture/trip-approval"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              <FiChevronLeft className="h-4 w-4" /> Back to Trip Approval
            </Link>

            <div className="mt-2 truncate text-base font-bold text-slate-900">
              {trip?.trip_id || `Trip #${id}`}
            </div>

            <div className="text-xs text-slate-500">
              Owner: <span className="font-semibold text-slate-800">{trip?.owner_code || "—"}</span>
              <span className="mx-2 text-slate-300">•</span>
              Location: <span className="font-semibold text-slate-800">{location}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <FiRefreshCcw className={`h-4 w-4 ${(tripLoading || clLoading) ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* errors */}
        {(showNotFound || clError) && (
          <div className="px-4 sm:px-6 py-3 space-y-2">
            {showNotFound && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-start gap-2">
                <FiAlertTriangle className="mt-0.5" />
                <span className="break-words">{tripError}</span>
              </div>
            )}
            {clError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-start gap-2">
                <FiAlertTriangle className="mt-0.5" />
                <span className="break-words">{clError}</span>
              </div>
            )}
          </div>
        )}

        {/* Trip Details (UPDATED COLUMNS to match your response) */}
        <div className="px-4 sm:px-6 py-5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base font-semibold text-slate-900">Trip Details</div>

            <div className="text-xs text-slate-500">
              Created:{" "}
              <span className="font-semibold text-slate-900">
                {created.date} {created.time ? `(${created.time})` : ""}
              </span>
              <span className="mx-2 text-slate-300">•</span>
              Updated:{" "}
              <span className="font-semibold text-slate-900">
                {updated.date} {updated.time ? `(${updated.time})` : ""}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              {/* ✅ fixed widths so Location/Diesel/Ice never merge */}
              <table className="w-full min-w-[1280px] table-fixed">
                <colgroup>
                  <col style={{ width: "240px" }} /> {/* Trip */}
                  <col style={{ width: "160px" }} /> {/* Owner */}
                  <col style={{ width: "280px" }} /> {/* Location */}
                  <col style={{ width: "140px" }} /> {/* Diesel */}
                  <col style={{ width: "120px" }} /> {/* Ice */}
                  <col style={{ width: "120px" }} /> {/* QR */}
                  <col style={{ width: "140px" }} /> {/* Total */}
                  <col style={{ width: "160px" }} /> {/* Approval */}
                </colgroup>

                <thead className="bg-slate-50">
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    <th className="px-6 py-4 whitespace-nowrap">Trip Code</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-slate-200">Owner Code</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-slate-200">Location</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-slate-200 text-right">Diesel</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-slate-200 text-right">Ice</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-slate-200 text-right">QR Count</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-slate-200 text-right">Total</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-slate-200 pr-8">Approval</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-sm">
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="truncate" title={trip?.trip_id || "—"}>{trip?.trip_id || "—"}</div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap border-l border-slate-200">
                      <div className="truncate" title={trip?.owner_code || "—"}>{trip?.owner_code || "—"}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-slate-200">
                      <div className="truncate" title={location}>{location}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-slate-200 text-right tabular-nums">
                      {fmtMoney(trip?.diesel)}
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-slate-200 text-right tabular-nums">
                      {fmtMoney(trip?.ice)}
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-slate-200 text-right tabular-nums">
                      {trip?.qr_count ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-slate-200 text-right tabular-nums">
                      {fmtMoney(trip?.total)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap border-l border-slate-200 pr-8">
                      <span
                        className={[
                          "inline-flex h-8 items-center rounded-xl border px-3 text-xs font-semibold capitalize",
                          String(trip?.approval_status || "pending").toLowerCase() === "approved"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-amber-200 bg-amber-50 text-amber-900",
                        ].join(" ")}
                      >
                        {trip?.approval_status || "pending"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Catch Logs (unchanged except safe layout) */}
        <div className="px-4 sm:px-6 py-5 border-t border-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div>
              <div className="text-base font-semibold text-slate-900">Catch Logs</div>
              <div className="text-xs text-slate-500">
                Total: <span className="font-semibold text-slate-900">{catchlogs.length}</span>
                <span className="mx-2 text-slate-300">•</span>
                Weight: <span className="font-semibold text-slate-900">{totalWeight.toFixed(2)} kg</span>
              </div>
            </div>

            <select
              className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"
              value={qcFilter}
              onChange={(e) => {
                const v = e.target.value;
                setQcFilter(v);
                dispatch(fetchCatchlogsForTrip({ tripId: id, qcStatus: v }));
              }}
            >
              <option value="all">All QC</option>
              <option value="checked">Checked</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {clLoading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">Loading catch logs…</div>
            ) : catchlogs.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">No catch logs for this trip.</div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1250px] table-fixed">
                  <colgroup>
                    <col style={{ width: "360px" }} />
                    <col style={{ width: "220px" }} />
                    <col style={{ width: "160px" }} />
                    <col style={{ width: "240px" }} />
                    <col style={{ width: "140px" }} />
                    <col style={{ width: "170px" }} />
                    <col style={{ width: "180px" }} />
                  </colgroup>

                  <thead className="bg-slate-50">
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Fish</th>
                      <th className="px-6 py-4">Weight</th>
                      <th className="px-6 py-4">QC</th>
                      <th className="px-6 py-4">Temp</th>
                      <th className="px-6 py-4">Damage</th>
                      <th className="px-6 py-4 pr-8">Coords</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 text-sm">
                    {catchlogs.map((c) => {
                      const img = safeImg(c?.image_url);
                      const fishName = c?.fish?.fish_name || c?.fish?.fish_code || "—";
                      const coords = c?.latitude && c?.longitude ? `${c.latitude}, ${c.longitude}` : "—";
                      const qcText = `${String(c?.qc_status || "—").toUpperCase()}${
                        c?.qc_result ? ` • ${String(c.qc_result).toUpperCase()}` : ""
                      }`;

                      return (
                        <tr key={c?.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-11 w-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shrink-0">
                                {img ? (
                                  <img src={img} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full grid place-items-center text-[11px] font-semibold text-slate-400">
                                    —
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-slate-900">{c?.code || `#${c?.id}`}</div>
                                <div className="truncate text-[12px] text-slate-500">{c?.type || "—"}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="truncate font-semibold text-slate-900" title={fishName}>{fishName}</div>
                            <div className="truncate text-[12px] text-slate-500">Grade: {c?.quality_grade || "—"}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{c?.weight ? `${c.weight} kg` : "—"}</div>
                            <div className="text-[12px] text-slate-500">
                              {c?.date ? new Date(c.date).toLocaleDateString("en-GB") : "—"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="truncate font-semibold text-slate-900" title={qcText}>{qcText}</div>
                            <div className="truncate text-[12px] text-slate-500" title={c?.reject_reason || "—"}>
                              Reject: {c?.reject_reason || "—"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">
                              {c?.temperature_c ? `${c.temperature_c}°C` : "—"}
                            </div>
                            <div className="text-[12px] text-slate-500">pH: {c?.ph_level ?? "—"}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{c?.is_damaged ? "Yes" : "No"}</div>
                            <div className="truncate text-[12px] text-slate-500">
                              {c?.size || "—"} {c?.damage ? `• ${c.damage}` : ""}
                            </div>
                          </td>

                          <td className="px-6 py-4 pr-8">
                            <div className="truncate font-semibold text-slate-800" title={coords}>{coords}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
