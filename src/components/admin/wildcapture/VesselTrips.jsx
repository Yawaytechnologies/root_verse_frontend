import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEye, FiEdit2, FiDownload } from "react-icons/fi";

/**
 * Admin — Wild Capture — Trips (Trip Logs)
 * Route: /admin/wild-capture/trips
 */
export default function TripsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ✅ Replace this with API data later
  const rows = useMemo(
    () => [
      {
        id: "TRIP-00021",
        vesselId: "VES-0007",
        vesselName: "FV Blue Pearl",
        skipper: "Ravi Kumar",
        startAt: "2025-12-01",
        endAt: "2025-12-03",
        faoZone: "FAO 51",
        landingCenter: "Chennai",
        status: "COMPLETED",
      },
      {
        id: "TRIP-00022",
        vesselId: "VES-0012",
        vesselName: "FV Sea King",
        skipper: "Suresh",
        startAt: "2025-12-10",
        endAt: "",
        faoZone: "FAO 57",
        landingCenter: "Nagapattinam",
        status: "IN_PROGRESS",
      },
      {
        id: "TRIP-00023",
        vesselId: "VES-0003",
        vesselName: "FV Ocean Star",
        skipper: "Mani",
        startAt: "2025-12-15",
        endAt: "",
        faoZone: "FAO 51",
        landingCenter: "Thoothukudi",
        status: "DRAFT",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return rows.filter((r) => {
      const matchQ =
        !needle ||
        r.id.toLowerCase().includes(needle) ||
        r.vesselId.toLowerCase().includes(needle) ||
        r.vesselName.toLowerCase().includes(needle) ||
        r.skipper.toLowerCase().includes(needle) ||
        (r.landingCenter || "").toLowerCase().includes(needle);

      const matchStatus = status === "ALL" || r.status === status;

      const matchDate =
        (!from || r.startAt >= from) && (!to || (r.endAt ? r.endAt <= to : r.startAt <= to));

      return matchQ && matchStatus && matchDate;
    });
  }, [rows, q, status, from, to]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Trips
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Create and manage vessel trip logs (capture runs).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Export coming soon")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-100"
            >
              <FiDownload /> Export
            </button>

            <Link
              to="/admin/wild-capture/trips/new"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
            >
              <FiPlus /> New Trip
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
            {/* Search */}
            <div className="md:col-span-5">
              <label className="text-xs font-semibold text-slate-600">Search</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <FiSearch className="text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Trip ID, vessel, skipper, landing center..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              >
                <option value="ALL">All</option>
                <option value="DRAFT">Draft</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Dates */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> trips
            </p>

            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("ALL");
                setFrom("");
                setTo("");
              }}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead className="bg-slate-100">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">Trip</th>
                  <th className="px-4 py-3">Vessel</th>
                  <th className="px-4 py-3">Skipper</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">FAO Zone</th>
                  <th className="px-4 py-3">Landing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="text-sm text-slate-800 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{r.id}</div>
                      <div className="text-xs text-slate-500">{r.vesselId}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">{r.vesselName}</div>
                    </td>

                    <td className="px-4 py-3">{r.skipper}</td>

                    <td className="px-4 py-3">{r.startAt || "—"}</td>

                    <td className="px-4 py-3">{r.endAt || "—"}</td>

                    <td className="px-4 py-3">{r.faoZone || "—"}</td>

                    <td className="px-4 py-3">{r.landingCenter || "—"}</td>

                    <td className="px-4 py-3">
                      <StatusPill value={r.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/wild-capture/trips/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                        >
                          <FiEye /> View
                        </Link>

                        <Link
                          to={`/admin/wild-capture/trips/${r.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                        >
                          <FiEdit2 /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                      No trips found. Try changing filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-xs text-slate-500">
          Next step: clicking a Trip should open details + link to Catch Logs / Landing & QC / Crates.
          (Because trips are the “spine” of the workflow. No trip = no traceability. Harsh but fair.)
        </p>
      </div>
    </div>
  );
}

function StatusPill({ value }) {
  const map = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
        map[value] || "bg-slate-100 text-slate-700 border-slate-200",
      ].join(" ")}
    >
      {String(value || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}
