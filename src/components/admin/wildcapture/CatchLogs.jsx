import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiEye, FiEdit2, FiDownload } from "react-icons/fi";

/**
 * Admin — Wild Capture — Catch Logs
 * Route: /admin/wild-capture/catch-logs
 */
export default function CatchLogsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tripId, setTripId] = useState("ALL");

  // ✅ Replace with API data later
  const rows = useMemo(
    () => [
      {
        id: "CL-01001",
        tripId: "TRIP-00021",
        vesselName: "FV Blue Pearl",
        date: "2025-12-01",
        species: "Yellowfin Tuna",
        grade: "A",
        gear: "Longline",
        qtyKg: 420,
        faoZone: "FAO 51",
        status: "SUBMITTED",
      },
      {
        id: "CL-01002",
        tripId: "TRIP-00021",
        vesselName: "FV Blue Pearl",
        date: "2025-12-02",
        species: "Skipjack Tuna",
        grade: "B",
        gear: "Pole & line",
        qtyKg: 310,
        faoZone: "FAO 51",
        status: "DRAFT",
      },
      {
        id: "CL-01003",
        tripId: "TRIP-00022",
        vesselName: "FV Sea King",
        date: "2025-12-11",
        species: "Sardine",
        grade: "C",
        gear: "Gillnet",
        qtyKg: 980,
        faoZone: "FAO 57",
        status: "APPROVED",
      },
    ],
    []
  );

  const tripOptions = useMemo(() => {
    const uniq = Array.from(new Set(rows.map((r) => r.tripId)));
    return ["ALL", ...uniq];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return rows.filter((r) => {
      const matchQ =
        !needle ||
        r.id.toLowerCase().includes(needle) ||
        r.tripId.toLowerCase().includes(needle) ||
        r.vesselName.toLowerCase().includes(needle) ||
        r.species.toLowerCase().includes(needle) ||
        (r.grade || "").toLowerCase().includes(needle) ||
        (r.gear || "").toLowerCase().includes(needle) ||
        (r.faoZone || "").toLowerCase().includes(needle);

      const matchStatus = status === "ALL" || r.status === status;

      const matchTrip = tripId === "ALL" || r.tripId === tripId;

      const matchDate = (!from || r.date >= from) && (!to || r.date <= to);

      return matchQ && matchStatus && matchTrip && matchDate;
    });
  }, [rows, q, status, tripId, from, to]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Catch Logs
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Record catch by trip-day: species, grade, gear, quantity, and area.
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
              to="/admin/wild-capture/catch-logs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
            >
              <FiPlus /> New Catch Log
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
                  placeholder="Catch Log ID, Trip ID, vessel, species, gear..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Trip */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">Trip</label>
              <select
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              >
                {tripOptions.map((t) => (
                  <option key={t} value={t}>
                    {t === "ALL" ? "All Trips" : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              >
                <option value="ALL">All</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Dates */}
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-600">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              />
            </div>

            <div className="md:col-span-1">
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
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> catch logs
            </p>

            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("ALL");
                setTripId("ALL");
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
            <table className="min-w-[1080px] w-full">
              <thead className="bg-slate-100">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">Catch Log</th>
                  <th className="px-4 py-3">Trip</th>
                  <th className="px-4 py-3">Vessel</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Species</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Gear</th>
                  <th className="px-4 py-3">Qty (kg)</th>
                  <th className="px-4 py-3">FAO</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="text-sm text-slate-800 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900">{r.id}</div>
                      <div className="text-xs text-slate-500">Log for trip-day</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold">{r.tripId}</span>
                    </td>

                    <td className="px-4 py-3">{r.vesselName}</td>

                    <td className="px-4 py-3">{r.date || "—"}</td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">{r.species}</div>
                    </td>

                    <td className="px-4 py-3">{r.grade || "—"}</td>

                    <td className="px-4 py-3">{r.gear || "—"}</td>

                    <td className="px-4 py-3">{Number(r.qtyKg || 0).toLocaleString("en-IN")}</td>

                    <td className="px-4 py-3">{r.faoZone || "—"}</td>

                    <td className="px-4 py-3">
                      <StatusPill value={r.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/wild-capture/catch-logs/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                        >
                          <FiEye /> View
                        </Link>

                        <Link
                          to={`/admin/wild-capture/catch-logs/${r.id}/edit`}
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
                    <td colSpan={11} className="px-4 py-10 text-center text-sm text-slate-500">
                      No catch logs found. Try changing filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Catch Logs should usually be tied to a Trip. Once approved, they feed Landing & QC and crate
          allocation downstream — so yeah, this table is more important than it looks.
        </p>
      </div>
    </div>
  );
}

function StatusPill({ value }) {
  const map = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    SUBMITTED: "bg-amber-50 text-amber-800 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold",
        map[value] || "bg-slate-100 text-slate-700 border-slate-200",
      ].join(" ")}
    >
      {String(value || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}
