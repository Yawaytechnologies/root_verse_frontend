import { useMemo, useState } from "react";
import {
  FiSearch,
  FiRefreshCcw,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiCalendar,
  FiUser,
  FiHash,
  FiThermometer,
  FiDroplet,
  FiPackage,
  FiClipboard,
  FiDownload,
} from "react-icons/fi";

const ACCENT = "#22e5a6";

const DUMMY = Array.from({ length: 22 }).map((_, i) => {
  const id = 5000 + i;
  const statuses = ["passed", "hold", "rejected"];
  const grades = ["A", "B", "C"];
  const inspectors = ["Karthik", "Santhosh", "Meena", "Priya", "Arun"];
  const species = ["Yellowfin Tuna", "Mackerel", "Red Snapper", "Sardine", "Pomfret"];
  const methods = ["hook&line", "gillnet", "trawl", "longline"];

  const status = statuses[i % statuses.length];
  const grade = grades[(i + 1) % grades.length];

  const temp = (i % 9) + 1; // 1..9 °C
  const moisture = 68 + (i % 12); // 68..79 %
  const histamine = 12 + (i % 20); // 12..31 ppm
  const weightKg = 20 + (i % 15) * 6; // 20..104 kg
  const defects = (i % 4) === 0 ? ["Bruising"] : (i % 7) === 0 ? ["Odor"] : [];

  return {
    id,
    inspectionId: `QI-${id}`,
    lotId: `LOT-${900 + (i % 12)}`,
    tripId: `TRIP-${1000 + (i % 14)}`,
    ownerCode: `OWN-${String((i % 9) + 1).padStart(3, "0")}`,
    vessel: `RV-SEA-${String((i % 7) + 1).padStart(2, "0")}`,
    species: species[i % species.length],
    method: methods[i % methods.length],
    inspectedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 18).toISOString(),
    inspector: inspectors[i % inspectors.length],
    status,
    grade,
    tempC: temp,
    moisturePct: moisture,
    histaminePpm: histamine,
    weightKg,
    defects,
    notes:
      status === "passed"
        ? "Meets acceptance criteria. Clear eyes, firm flesh. Temp within range."
        : status === "hold"
        ? "Hold for re-check. Minor quality concerns or missing lab confirmation."
        : "Rejected due to unacceptable indicators. Needs segregation and report.",
  };
});

function fmtDT(v) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function Pill({ tone = "emerald", children }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  if (status === "passed") {
    return (
      <Pill tone="emerald">
        <FiCheckCircle className="h-3.5 w-3.5" />
        PASSED
      </Pill>
    );
  }
  if (status === "hold") {
    return (
      <Pill tone="amber">
        <FiAlertTriangle className="h-3.5 w-3.5" />
        HOLD
      </Pill>
    );
  }
  return (
    <Pill tone="rose">
      <FiXCircle className="h-3.5 w-3.5" />
      REJECTED
    </Pill>
  );
}

function GradePill({ grade }) {
  const tone = grade === "A" ? "emerald" : grade === "B" ? "amber" : "rose";
  return <Pill tone={tone}>GRADE {grade}</Pill>;
}

function SmallLabel({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      <span className="font-semibold text-slate-500">{label}:</span>
      <span className="font-extrabold text-slate-800">{value}</span>
    </div>
  );
}

function Modal({ open, onClose, row }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-3xl overflow-y-auto rounded-3xl border border-emerald-100 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.25)] max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Inspection Details</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{row?.inspectionId}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <FiXCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={row?.status} />
            <GradePill grade={row?.grade} />
            <Pill tone="slate">
              <FiCalendar className="h-3.5 w-3.5" />
              {fmtDT(row?.inspectedAt)}
            </Pill>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailCard title="Identifiers" icon={FiHash}>
              <DetailLine label="Lot ID" value={row?.lotId} />
              <DetailLine label="Trip ID" value={row?.tripId} />
              <DetailLine label="Owner" value={row?.ownerCode} />
              <DetailLine label="Vessel" value={row?.vessel} />
            </DetailCard>

            <DetailCard title="Catch Info" icon={FiPackage}>
              <DetailLine label="Species" value={row?.species} />
              <DetailLine label="Method" value={row?.method} />
              <DetailLine label="Weight" value={`${row?.weightKg} kg`} />
              <DetailLine label="Defects" value={(row?.defects?.length ? row.defects.join(", ") : "None")} />
            </DetailCard>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MetricCard icon={FiThermometer} label="Temp" value={`${row?.tempC}°C`} />
            <MetricCard icon={FiDroplet} label="Moisture" value={`${row?.moisturePct}%`} />
            <MetricCard icon={FiClipboard} label="Histamine" value={`${row?.histaminePpm} ppm`} />
          </div>

          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Notes
            </div>
            <p className="mt-2 text-sm text-slate-700">{row?.notes}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <FiUser className="h-3.5 w-3.5 text-slate-400" />
              Inspector: <span className="font-extrabold text-slate-800">{row?.inspector}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            className="rounded-2xl px-4 py-2 text-sm font-extrabold text-[#04110c]"
            style={{
              background: ACCENT,
              boxShadow: "0 12px 26px rgba(34,229,166,0.20)",
            }}
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div
          className="grid h-9 w-9 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-900"
          style={{ borderColor: "rgba(34,229,166,0.35)" }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-slate-500 font-semibold">{label}</div>
      <div className="text-slate-900 font-extrabold">{value ?? "—"}</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
        <Icon className="h-4 w-4 text-slate-500" />
        {label}
      </div>
      <div className="mt-2 text-lg font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

export default function QualityInspectionLogsDummy() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [grade, setGrade] = useState("all");
  const [openRow, setOpenRow] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DUMMY.filter((r) => {
      const matchQ =
        !q ||
        r.inspectionId.toLowerCase().includes(q) ||
        r.lotId.toLowerCase().includes(q) ||
        r.tripId.toLowerCase().includes(q) ||
        r.ownerCode.toLowerCase().includes(q) ||
        r.vessel.toLowerCase().includes(q) ||
        r.species.toLowerCase().includes(q) ||
        r.inspector.toLowerCase().includes(q);

      const matchStatus = status === "all" ? true : r.status === status;
      const matchGrade = grade === "all" ? true : r.grade === grade;
      return matchQ && matchStatus && matchGrade;
    });
  }, [search, status, grade]);

  const counts = useMemo(() => {
    const c = { passed: 0, hold: 0, rejected: 0 };
    for (const r of filtered) c[r.status]++;
    return c;
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Top card */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/75 backdrop-blur-xl shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-28 -top-24 h-[360px] w-[360px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(34,229,166,0.18), transparent 60%)",
            }}
          />
          <div
            className="absolute -left-24 -bottom-24 h-[320px] w-[320px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(34,229,166,0.10), transparent 60%)",
            }}
          />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-900">
                Quality • Inspection Logs
              </div>

              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Quality Inspection Logs
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Dummy UI for inspected lots (status, grade, measurements, notes).
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="emerald">Passed: {counts.passed}</Pill>
                <Pill tone="amber">Hold: {counts.hold}</Pill>
                <Pill tone="rose">Rejected: {counts.rejected}</Pill>
                <Pill tone="slate">Total: {filtered.length}</Pill>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-50"
              >
                <FiRefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-50"
              >
                <FiDownload className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search inspection, lot, trip, owner, vessel, species, inspector…"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="all">All status</option>
                <option value="passed">Passed</option>
                <option value="hold">Hold</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="all">All grade</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-5 hidden overflow-hidden rounded-3xl border border-emerald-100 bg-white/75 backdrop-blur-xl shadow-sm md:block">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
          <div className="text-sm font-extrabold text-slate-900">Inspections</div>
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-extrabold">{filtered.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-xs font-extrabold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3">Inspection</th>
                <th className="px-5 py-3">Lot / Trip</th>
                <th className="px-5 py-3">Owner / Vessel</th>
                <th className="px-5 py-3">Species</th>
                <th className="px-5 py-3">Measurements</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/70">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-emerald-50/35">
                  <td className="px-5 py-4">
                    <div className="font-extrabold text-slate-900">{r.inspectionId}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <GradePill grade={r.grade} />
                      <Pill tone="slate">
                        <FiCalendar className="h-3.5 w-3.5" />
                        {fmtDT(r.inspectedAt)}
                      </Pill>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                      <FiUser className="h-3.5 w-3.5 text-slate-400" />
                      Inspector: <span className="font-extrabold text-slate-800">{r.inspector}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-extrabold text-slate-900">{r.lotId}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">{r.tripId}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-extrabold text-slate-900">{r.ownerCode}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">{r.vessel}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-extrabold text-slate-900">{r.species}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">
                      Method: <span className="font-extrabold text-slate-800">{r.method}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Weight: <span className="font-extrabold text-slate-800">{r.weightKg} kg</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <SmallLabel icon={FiThermometer} label="Temp" value={`${r.tempC}°C`} />
                      <SmallLabel icon={FiDroplet} label="Moisture" value={`${r.moisturePct}%`} />
                      <SmallLabel icon={FiClipboard} label="Histamine" value={`${r.histaminePpm} ppm`} />
                    </div>
                    {r.defects?.length ? (
                      <div className="mt-2 text-xs font-extrabold text-rose-700">
                        Defects: {r.defects.join(", ")}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs font-semibold text-slate-500">Defects: None</div>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <StatusPill status={r.status} />
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setOpenRow(r)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
                    >
                      <FiEye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No inspections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="mt-5 space-y-3 md:hidden">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/75 backdrop-blur-xl shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{r.inspectionId}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{fmtDT(r.inspectedAt)}</div>
                </div>
                <StatusPill status={r.status} />
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <GradePill grade={r.grade} />
                <Pill tone="slate">
                  <FiUser className="h-3.5 w-3.5" />
                  {r.inspector}
                </Pill>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Mini label="Lot" value={r.lotId} />
                <Mini label="Trip" value={r.tripId} />
                <Mini label="Owner" value={r.ownerCode} />
                <Mini label="Vessel" value={r.vessel} />
              </div>

              <div className="mt-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Measurements
                </div>
                <div className="mt-2 space-y-1">
                  <SmallLabel icon={FiThermometer} label="Temp" value={`${r.tempC}°C`} />
                  <SmallLabel icon={FiDroplet} label="Moisture" value={`${r.moisturePct}%`} />
                  <SmallLabel icon={FiClipboard} label="Histamine" value={`${r.histaminePpm} ppm`} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Species</div>
                  <div className="text-sm font-extrabold text-slate-900">{r.species}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenRow(r)}
                  className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold text-[#04110c]"
                  style={{
                    background: ACCENT,
                    boxShadow: "0 12px 26px rgba(34,229,166,0.20)",
                  }}
                >
                  <FiEye className="h-4 w-4" />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-emerald-100 bg-white/75 p-10 text-center text-sm text-slate-500">
            No inspections found.
          </div>
        )}
      </div>

      <Modal open={!!openRow} onClose={() => setOpenRow(null)} row={openRow} />
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
