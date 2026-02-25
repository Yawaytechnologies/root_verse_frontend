import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiRefreshCcw,
  FiEye,
  FiImage,
  FiX,
} from "react-icons/fi";

import {
  fetchTripDetails,
  fetchCatchlogsForTrip,
} from "../../../redux/reducer/tripapprovalSlice";

const UI_FONT =
  "'Segoe UI', Tahoma, Arial, system-ui, -apple-system, sans-serif";

function safeImg(url) {
  if (!url) return "";
  return String(url).replace(/%22/g, "").replace(/"/g, "");
}

function fmtMoney(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function dateParts(v) {
  if (!v) return { date: "—", time: "" };
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return { date: String(v), time: "" };
  const date = d.toLocaleDateString("en-GB");
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function fmtISO(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString("en-GB", { hour12: true });
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

function ModalShell({ title, onClose, children, size = "max-w-4xl" }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="h-full w-full overflow-y-auto p-3 sm:p-6">
        <div className={`mx-auto w-full ${size}`}>
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
                <FiX className="h-4 w-4 text-emerald-900" />
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
      <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-900/60">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900 break-words">
        {value}
      </div>
    </div>
  );
}

export default function TripApprovalDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const pending = useSelector((s) => s.trip.pending || []);
  const approved = useSelector((s) => s.trip.approved || []);

  const rawDetails = useSelector((s) => s.trip.tripDetailsById?.[id] || null);
  const tripLoading = useSelector((s) => !!s.trip.tripDetailsLoadingById?.[id]);
  const tripError = useSelector(
    (s) => s.trip.tripDetailsErrorById?.[id] || null
  );

  const tripFromLinkState = state?.trip || null;

  const tripFromList = useMemo(() => {
    const all = [...pending, ...approved];
    return all.find((t) => String(t?.id) === String(id)) || null;
  }, [pending, approved, id]);

  const trip = useMemo(() => {
    return (
      normalizeTrip(rawDetails) ||
      normalizeTrip(tripFromLinkState) ||
      normalizeTrip(tripFromList)
    );
  }, [rawDetails, tripFromLinkState, tripFromList]);

  const catchlogs = useSelector((s) => s.trip.catchlogsByTripId?.[id] || []);
  const clLoading = useSelector((s) => !!s.trip.catchlogsLoadingByTripId?.[id]);
  const clError = useSelector(
    (s) => s.trip.catchlogsErrorByTripId?.[id] || null
  );

  // popups
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeCatch, setActiveCatch] = useState(null);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchTripDetails({ id }));
    dispatch(fetchCatchlogsForTrip({ tripId: id, qcStatus: "all" }));
  }, [dispatch, id]);

  const refresh = () => {
    dispatch(fetchTripDetails({ id }));
    dispatch(fetchCatchlogsForTrip({ tripId: id, qcStatus: "all" }));
  };

  const created = dateParts(trip?.created_at);
  const updated = dateParts(trip?.updated_at);

  const showNotFound = !!tripError && !trip;

  const location = trip?.location_name ?? trip?.near_station ?? "—";

  const openImage = (url) => {
    const u = safeImg(url);
    if (!u) return;
    setImgUrl(u);
    setImgOpen(true);
  };

  const openCatchDetails = (c) => {
    setActiveCatch(c);
    setDetailsOpen(true);
  };

  const closeCatchDetails = () => {
    setDetailsOpen(false);
    setActiveCatch(null);
  };

  const closeImage = () => {
    setImgOpen(false);
    setImgUrl("");
  };

  return (
    <div className="w-full" style={{ fontFamily: UI_FONT, fontWeight: 400 }}>
      <div className="rounded-3xl border border-emerald-100 bg-white/85 backdrop-blur-xl shadow-sm">
        {/* top bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-4 sm:px-6 border-b border-emerald-100">
          <div className="min-w-0">
            <Link
              to="/admin/wild-capture/trip-approval"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
            >
              <FiChevronLeft className="h-4 w-4" /> Back to Trip Approval
            </Link>

            <div className="mt-2 truncate text-base font-extrabold text-slate-900">
              {trip?.trip_id || `Trip #${id}`}
            </div>

            <div className="text-xs text-slate-500">
              Owner:{" "}
              <span className="font-semibold text-slate-800">
                {trip?.owner_code || "—"}
              </span>
              <span className="mx-2 text-emerald-200">•</span>
              Location:{" "}
              <span className="font-semibold text-slate-800">{location}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50"
          >
            <FiRefreshCcw
              className={`h-4 w-4 ${
                tripLoading || clLoading ? "animate-spin" : ""
              }`}
            />
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

        {/* Trip Details */}
        <div className="px-4 sm:px-6 py-5 border-t border-emerald-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base font-extrabold text-slate-900">
              Trip Details
            </div>

            <div className="text-xs text-slate-500">
              Created:{" "}
              <span className="font-semibold text-slate-900">
                {created.date} {created.time ? `(${created.time})` : ""}
              </span>
              <span className="mx-2 text-emerald-200">•</span>
              Updated:{" "}
              <span className="font-semibold text-slate-900">
                {updated.date} {updated.time ? `(${updated.time})` : ""}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1280px] table-fixed">
                <colgroup>
                  <col style={{ width: "240px" }} />
                  <col style={{ width: "160px" }} />
                  <col style={{ width: "280px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "160px" }} />
                </colgroup>

                <thead className="bg-emerald-50/60">
                  <tr className="text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-950/70">
                    <th className="px-6 py-4 whitespace-nowrap">Trip Code</th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-emerald-100">
                      Owner Code
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-emerald-100">
                      Location
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-emerald-100 text-right">
                      Diesel
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-emerald-100 text-right">
                      Ice
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-emerald-100 text-right">
                      QR Count
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-emerald-100 text-right">
                      Total
                    </th>
                    <th className="px-6 py-4 whitespace-nowrap border-l border-emerald-100 pr-8">
                      Approval
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-100 text-sm">
                  <tr className="hover:bg-emerald-50/30 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="truncate" title={trip?.trip_id || "—"}>
                        {trip?.trip_id || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap border-l border-emerald-100">
                      <div className="truncate" title={trip?.owner_code || "—"}>
                        {trip?.owner_code || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-emerald-100">
                      <div className="truncate" title={location}>
                        {location}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-emerald-100 text-right tabular-nums">
                      {fmtMoney(trip?.diesel)}
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-emerald-100 text-right tabular-nums">
                      {fmtMoney(trip?.ice)}
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-emerald-100 text-right tabular-nums">
                      {trip?.qr_count ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-700 whitespace-nowrap border-l border-emerald-100 text-right tabular-nums">
                      {fmtMoney(trip?.total)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap border-l border-emerald-100 pr-8">
                      <span
                        className={[
                          "inline-flex h-8 items-center rounded-xl border px-3 text-xs font-extrabold capitalize",
                          String(trip?.approval_status || "pending").toLowerCase() ===
                          "approved"
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

        {/* Catch Logs */}
        <div className="px-4 sm:px-6 py-5 border-t border-emerald-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div>
              <div className="text-base font-extrabold text-slate-900">
                Catch Logs
              </div>
              <div className="text-xs text-slate-500">
                Total:{" "}
                <span className="font-semibold text-slate-900">
                  {catchlogs.length}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
            {clLoading ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading catch logs…
              </div>
            ) : catchlogs.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                No catch logs for this trip.
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden lg:block">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[980px] table-fixed">
                      <colgroup>
                        <col style={{ width: "340px" }} />
                        <col style={{ width: "240px" }} />
                        <col style={{ width: "240px" }} />
                        <col style={{ width: "200px" }} />
                        <col style={{ width: "220px" }} />
                      </colgroup>

                      <thead className="bg-emerald-50/60">
                        <tr className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-950/70">
                          <th className="px-6 py-4 text-center">Code</th>
                          <th className="px-6 py-4 text-center">Fish Name</th>
                          <th className="px-6 py-4 text-center">Vessel Name</th>
                          <th className="px-6 py-4 text-center">Date &amp; Time</th>
                          <th className="px-6 py-4 text-center pr-8">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-emerald-100 text-sm">
                        {catchlogs.map((c) => {
                          const img = safeImg(c?.image_url);
                          const code = c?.code || `#${c?.id}`;
                          const fishName =
                            c?.fish?.fish_name || c?.fish?.fish_code || "—";
                          const vesselName =
                            c?.vessel?.vessel_name || c?.vessel_name || "—";
                          const date = c?.date
                            ? new Date(c.date).toLocaleDateString("en-GB")
                            : "—";
                          const time = c?.time || "—";

                          return (
                            <tr
                              key={c?.id}
                              className="hover:bg-emerald-50/30 transition"
                            >
                              {/* CODE */}
                              <td className="px-6 py-4 text-center align-middle">
                                <div className="flex flex-col items-center">
                                  <div
                                    className="font-extrabold text-slate-900 truncate max-w-[320px]"
                                    title={code}
                                  >
                                    {code}
                                  </div>
                                  <div className="text-[12px] text-slate-500 truncate max-w-[320px]">
                                    Type: {c?.type || "—"} • Status:{" "}
                                    {c?.status || "—"}
                                  </div>
                                </div>
                              </td>

                              {/* FISH */}
                              <td className="px-6 py-4 text-center align-middle">
                                <div className="flex flex-col items-center">
                                  <div
                                    className="font-semibold text-slate-900 truncate max-w-[220px]"
                                    title={fishName}
                                  >
                                    {fishName}
                                  </div>
                                  <div className="text-[12px] text-slate-500 truncate max-w-[220px]">
                                    Fish Code: {c?.fish?.fish_code || "—"}
                                  </div>
                                </div>
                              </td>

                              {/* VESSEL */}
                              <td className="px-6 py-4 text-center align-middle">
                                <div className="flex flex-col items-center">
                                  <div
                                    className="font-semibold text-slate-900 truncate max-w-[220px]"
                                    title={vesselName}
                                  >
                                    {vesselName}
                                  </div>
                                  <div className="text-[12px] text-slate-500 truncate max-w-[220px]">
                                    {c?.vessel?.rv_vessel_id || "—"}
                                  </div>
                                </div>
                              </td>

                              {/* DATE & TIME */}
                              <td className="px-6 py-4 text-center align-middle">
                                <div className="flex flex-col items-center">
                                  <div className="font-semibold text-slate-900">
                                    {date}
                                  </div>
                                  <div className="text-[12px] text-slate-500">
                                    {time}
                                  </div>
                                </div>
                              </td>

                              {/* ACTIONS */}
                              <td className="px-6 py-4 text-center align-middle pr-8">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openImage(img)}
                                    disabled={!img}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold text-emerald-950 hover:bg-emerald-50 disabled:opacity-50"
                                  >
                                    <FiImage className="h-4 w-4" />
                                    Image
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openCatchDetails(c)}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-800"
                                  >
                                    <FiEye className="h-4 w-4" />
                                    Details
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

                {/* Mobile cards */}
                <div className="lg:hidden divide-y divide-emerald-100">
                  {catchlogs.map((c) => {
                    const img = safeImg(c?.image_url);
                    const code = c?.code || `#${c?.id}`;
                    const fishName =
                      c?.fish?.fish_name || c?.fish?.fish_code || "—";
                    const vesselName =
                      c?.vessel?.vessel_name || c?.vessel_name || "—";
                    const date = c?.date
                      ? new Date(c.date).toLocaleDateString("en-GB")
                      : "—";
                    const time = c?.time || "—";

                    return (
                      <div key={c?.id} className="p-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold text-slate-900">
                            {code}
                          </div>

                          <div className="mt-1 text-[12px] text-slate-600 truncate">
                            Fish:{" "}
                            <span className="font-semibold text-slate-900">
                              {fishName}
                            </span>
                          </div>

                          <div className="mt-1 text-[12px] text-slate-600 truncate">
                            Vessel:{" "}
                            <span className="font-semibold text-slate-900">
                              {vesselName}
                            </span>
                          </div>

                          <div className="mt-2 text-[12px] text-slate-500">
                            {date} • {time}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openImage(img)}
                              disabled={!img}
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold text-emerald-950 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <FiImage className="h-4 w-4" />
                              Image
                            </button>
                            <button
                              type="button"
                              onClick={() => openCatchDetails(c)}
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-800"
                            >
                              <FiEye className="h-4 w-4" />
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE POPUP */}
      {imgOpen && (
        <ModalShell title="Catch Log Image" onClose={closeImage} size="max-w-5xl">
          {!imgUrl ? (
            <div className="text-sm text-slate-500">No image available.</div>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
              <div className="max-h-[70vh] w-full overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                <img
                  src={imgUrl}
                  alt=""
                  className="h-full w-full object-contain"
                  style={{ maxHeight: "70vh" }}
                />
              </div>
              <div className="mt-3 text-[12px] text-slate-500 break-all">
                {imgUrl}
              </div>
            </div>
          )}
        </ModalShell>
      )}

      {/* DETAILS POPUP */}
      {detailsOpen && activeCatch && (
        <ModalShell title="Catch Log Details" onClose={closeCatchDetails}>
          {(() => {
            const c = activeCatch;

            const code = c?.code || `#${c?.id}`;
            const fishName = c?.fish?.fish_name || c?.fish?.fish_code || "—";
            const fishCode = c?.fish?.fish_code || "—";
            const vesselName = c?.vessel?.vessel_name || "—";
            const rvVesselId = c?.vessel?.rv_vessel_id || "—";

            const date = c?.date
              ? new Date(c.date).toLocaleDateString("en-GB")
              : "—";
            const time = c?.time || "—";

            const coords =
              c?.latitude && c?.longitude
                ? `${c.latitude}, ${c.longitude}`
                : "—";

            return (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="text-lg font-extrabold text-slate-900 truncate">
                    {code}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {date} • {time}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard label="Fish Name" value={fishName} />
                  <InfoCard label="Fish Code" value={fishCode} />
                  <InfoCard label="Vessel Name" value={vesselName} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard label="RV Vessel ID" value={rvVesselId} />
                  <InfoCard label="Owner ID" value={c?.owner_id ?? "—"} />
                  <InfoCard label="Trip ID" value={c?.trip_id ?? "—"} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard label="Type" value={c?.type || "—"} />
                  <InfoCard label="Status" value={c?.status || "—"} />
                  <InfoCard label="Coordinates" value={coords} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <InfoCard
                    label="Damaged"
                    value={c?.is_damaged ? "Yes" : "No"}
                  />
                  <InfoCard label="Damage Notes" value={c?.damage || "—"} />
                  <InfoCard label="Reject Reason" value={c?.reject_reason || "—"} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <InfoCard label="Created At" value={fmtISO(c?.created_at)} />
                  <InfoCard label="Updated At" value={fmtISO(c?.updated_at)} />
                </div>
              </div>
            );
          })()}
        </ModalShell>
      )}
    </div>
  );
}