import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiDownload,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
} from "react-icons/fi";

/**
 * Admin — Wild Capture — Landing & QC
 * Route: /admin/wild-capture/landing-qc
 *
 * Real-world Tamil Nadu-ish fields:
 * - Landing center / harbor
 * - Trip + Catch Log reference
 * - Lot / Auction reference (typical landing practice)
 * - QC: organoleptic score, temperature, icing, freshness grade, contamination check
 * - Decision: ACCEPT / HOLD / REJECT
 * - Inspector + timestamp
 */
export default function LandingQCPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [center, setCenter] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // ✅ Replace with API data later
  const rows = useMemo(
    () => [
      {
        id: "LQC-02011",
        date: "2025-12-03",
        tripId: "TRIP-00021",
        catchLogId: "CL-01001",
        vessel: "FV Blue Pearl",
        landingCenter: "Chennai Fishing Harbour",
        district: "Chennai",
        lotNo: "LOT-CHN-1184",
        species: "Yellowfin Tuna",
        grade: "A",
        qtyKg: 420,
        tempC: 2.8,
        icing: "OK",
        organoleptic: 4.5, // out of 5
        histamine: "N/A",
        decision: "ACCEPTED",
        inspector: "QC Arun",
        notes: "Good icing, firm flesh, clear eyes; approved for crate allocation.",
      },
      {
        id: "LQC-02012",
        date: "2025-12-03",
        tripId: "TRIP-00021",
        catchLogId: "CL-01002",
        vessel: "FV Blue Pearl",
        landingCenter: "Chennai Fishing Harbour",
        district: "Chennai",
        lotNo: "LOT-CHN-1186",
        species: "Skipjack Tuna",
        grade: "B",
        qtyKg: 310,
        tempC: 5.9,
        icing: "LOW",
        organoleptic: 3.1,
        histamine: "N/A",
        decision: "ON_HOLD",
        inspector: "QC Arun",
        notes: "Icing low; move to chilled holding area, recheck after icing top-up.",
      },
      {
        id: "LQC-02013",
        date: "2025-12-11",
        tripId: "TRIP-00022",
        catchLogId: "CL-01003",
        vessel: "FV Sea King",
        landingCenter: "Nagapattinam Landing Center",
        district: "Nagapattinam",
        lotNo: "LOT-NPM-0421",
        species: "Sardine",
        grade: "C",
        qtyKg: 980,
        tempC: 8.2,
        icing: "POOR",
        organoleptic: 2.2,
        histamine: "N/A",
        decision: "REJECTED",
        inspector: "QC Priya",
        notes: "High temp + poor icing; off-odour detected. Rejected for human consumption chain.",
      },
      {
        id: "LQC-02014",
        date: "2025-12-16",
        tripId: "TRIP-00023",
        catchLogId: "CL-01004",
        vessel: "FV Ocean Star",
        landingCenter: "Thoothukudi Fishing Harbour",
        district: "Thoothukudi",
        lotNo: "LOT-TUT-0097",
        species: "Ribbonfish",
        grade: "B",
        qtyKg: 520,
        tempC: 3.6,
        icing: "OK",
        organoleptic: 3.8,
        histamine: "N/A",
        decision: "SUBMITTED",
        inspector: "—",
        notes: "Awaiting QC assignment.",
      },
    ],
    []
  );

  const centers = useMemo(() => {
    const uniq = Array.from(new Set(rows.map((r) => r.landingCenter)));
    return ["ALL", ...uniq];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return rows.filter((r) => {
      const matchQ =
        !needle ||
        r.id.toLowerCase().includes(needle) ||
        r.tripId.toLowerCase().includes(needle) ||
        r.catchLogId.toLowerCase().includes(needle) ||
        r.vessel.toLowerCase().includes(needle) ||
        r.landingCenter.toLowerCase().includes(needle) ||
        (r.lotNo || "").toLowerCase().includes(needle) ||
        (r.species || "").toLowerCase().includes(needle) ||
        (r.district || "").toLowerCase().includes(needle);

      const matchStatus = status === "ALL" || r.decision === status;
      const matchCenter = center === "ALL" || r.landingCenter === center;
      const matchDate = (!from || r.date >= from) && (!to || r.date <= to);

      return matchQ && matchStatus && matchCenter && matchDate;
    });
  }, [rows, q, status, center, from, to]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Landing & QC
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Record landing verification + quality checks at Tamil Nadu landing centers (lot-wise).
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
              to="/admin/wild-capture/landing-qc/new"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
            >
              <FiPlus /> New Landing QC
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
                  placeholder="LQC ID, Trip ID, Catch Log, lot, vessel, center..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Center */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600">Landing Center</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              >
                {centers.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All Centers" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Decision</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none"
              >
                <option value="ALL">All</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ON_HOLD">On hold</option>
                <option value="ACCEPTED">Accepted</option>
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
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> QC records
            </p>

            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("ALL");
                setCenter("ALL");
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
            <table className="min-w-[1200px] w-full">
              <thead className="bg-slate-100">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">LQC</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Trip / Catch Log</th>
                  <th className="px-4 py-3">Landing Center</th>
                  <th className="px-4 py-3">Lot</th>
                  <th className="px-4 py-3">Species</th>
                  <th className="px-4 py-3">Qty (kg)</th>
                  <th className="px-4 py-3">Temp (°C)</th>
                  <th className="px-4 py-3">Icing</th>
                  <th className="px-4 py-3">Org.</th>
                  <th className="px-4 py-3">Decision</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="text-sm text-slate-800 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900">{r.id}</div>
                      <div className="text-xs text-slate-500">{r.vessel}</div>
                    </td>

                    <td className="px-4 py-3">{r.date || "—"}</td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">{r.tripId}</div>
                      <div className="text-xs text-slate-500">{r.catchLogId}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">{r.landingCenter}</div>
                      <div className="text-xs text-slate-500">{r.district}</div>
                    </td>

                    <td className="px-4 py-3">{r.lotNo || "—"}</td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">{r.species}</div>
                      <div className="text-xs text-slate-500">Grade: {r.grade || "—"}</div>
                    </td>

                    <td className="px-4 py-3">{Number(r.qtyKg || 0).toLocaleString("en-IN")}</td>

                    <td className="px-4 py-3">
                      <span className={tempClass(r.tempC)}>{fmtTemp(r.tempC)}</span>
                    </td>

                    <td className="px-4 py-3">
                      <IcingPill value={r.icing} />
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold">{fmtOrg(r.organoleptic)}</span>
                      <span className="text-xs text-slate-500"> / 5</span>
                    </td>

                    <td className="px-4 py-3">
                      <DecisionPill value={r.decision} />
                    </td>

                    <td className="px-4 py-3">{r.inspector || "—"}</td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/wild-capture/landing-qc/${r.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                        >
                          <FiEye /> View
                        </Link>

                        <Link
                          to={`/admin/wild-capture/landing-qc/${r.id}/edit`}
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
                    <td colSpan={13} className="px-4 py-10 text-center text-sm text-slate-500">
                      No landing QC records found. Try changing filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Practical note */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
          <div className="font-bold text-slate-900">How this works in real life (simple):</div>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Fish lands at a center (harbour/landing point) and gets grouped into lots (auction/lot number).</li>
            <li>QC checks temperature + icing + freshness (organoleptic) before it goes into crates.</li>
            <li><span className="font-semibold">Accepted</span> → proceed to Crates & PCC. <span className="font-semibold">Hold</span> → re-ice/recheck. <span className="font-semibold">Rejected</span> → stop food-chain movement.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function DecisionPill({ value }) {
  const map = {
    SUBMITTED: { cls: "bg-slate-100 text-slate-700 border-slate-200", icon: FiClock, label: "Submitted" },
    ON_HOLD: { cls: "bg-amber-50 text-amber-800 border-amber-200", icon: FiAlertTriangle, label: "On hold" },
    ACCEPTED: { cls: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: FiCheckCircle, label: "Accepted" },
    REJECTED: { cls: "bg-rose-50 text-rose-800 border-rose-200", icon: FiAlertTriangle, label: "Rejected" },
  };

  const x = map[value] || { cls: "bg-slate-100 text-slate-700 border-slate-200", icon: FiClock, label: String(value || "Unknown") };
  const Icon = x.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold ${x.cls}`}>
      <Icon className="h-4 w-4" />
      {x.label}
    </span>
  );
}

function IcingPill({ value }) {
  const map = {
    OK: "bg-emerald-50 text-emerald-800 border-emerald-200",
    LOW: "bg-amber-50 text-amber-800 border-amber-200",
    POOR: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold ${map[value] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {value || "—"}
    </span>
  );
}

function fmtTemp(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  return Number(v).toFixed(1);
}

function fmtOrg(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "—";
  return Number(v).toFixed(1);
}

function tempClass(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "text-slate-700";
  const n = Number(v);
  if (n <= 4) return "font-extrabold text-emerald-700";
  if (n <= 7) return "font-extrabold text-amber-700";
  return "font-extrabold text-rose-700";
}
