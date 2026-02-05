import { useMemo, useState } from "react";
import {
  FiSearch,
  FiRefreshCcw,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiAnchor,
} from "react-icons/fi";

const ACCENT = "#22e5a6";

const DUMMY = Array.from({ length: 23 }).map((_, i) => {
  const id = 1000 + i;
  const statuses = ["verified", "pending", "rejected"];
  const methods = ["hook&line", "gillnet", "trawl", "longline"];
  const species = ["Yellowfin Tuna", "Mackerel", "Red Snapper", "Sardine", "Pomfret"];
  const stations = ["Chennai Harbor", "Nagapattinam", "Cuddalore", "Thoothukudi", "Rameswaram"];
  const vessel = ["RV-SEA-01", "RV-SEA-02", "RV-SEA-07", "RV-COAST-03", "RV-TRAWL-11"];

  const status = statuses[i % statuses.length];
  const qty = (i % 8) + 1;
  const weight = (i % 12) * 8 + 12;

  return {
    id,
    tripId: `TRIP-${id}`,
    ownerCode: `OWN-${(i % 7) + 1}`.padStart(7, "0"),
    vesselName: vessel[i % vessel.length],
    speciesName: species[i % species.length],
    fishingMethod: methods[i % methods.length],
    station: stations[i % stations.length],
    status,
    qty,
    weightKg: weight,
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 7).toISOString(),
  };
});

function Badge({ tone = "emerald", children }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  if (status === "verified") return <Badge tone="emerald">VERIFIED</Badge>;
  if (status === "pending") return <Badge tone="amber">PENDING</Badge>;
  return <Badge tone="rose">REJECTED</Badge>;
}

export default function CatchLogsDummy() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DUMMY.filter((r) => {
      const matchQ =
        !q ||
        r.tripId.toLowerCase().includes(q) ||
        r.ownerCode.toLowerCase().includes(q) ||
        r.vesselName.toLowerCase().includes(q) ||
        r.speciesName.toLowerCase().includes(q) ||
        r.station.toLowerCase().includes(q);

      const matchStatus = status === "all" ? true : r.status === status;
      return matchQ && matchStatus;
    });
  }, [search, status]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, safePage]);

  const counts = useMemo(() => {
    const c = { verified: 0, pending: 0, rejected: 0 };
    for (const r of filtered) c[r.status]++;
    return c;
  }, [filtered]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/75 backdrop-blur-xl shadow-sm">
        {/* subtle aura */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-20 h-[340px] w-[340px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(34,229,166,0.18), transparent 60%)",
            }}
          />
          <div
            className="absolute -left-24 -bottom-20 h-[340px] w-[340px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(34,229,166,0.12), transparent 60%)",
            }}
          />
        </div>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-900">
                Wild Capture • Catch Logs
              </div>

              <h1 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Catch Logs
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Dummy list UI (search, filter, table, mobile cards).
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="emerald">Verified: {counts.verified}</Badge>
                <Badge tone="amber">Pending: {counts.pending}</Badge>
                <Badge tone="rose">Rejected: {counts.rejected}</Badge>
                <Badge tone="slate">Total: {total}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <FiRefreshCcw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                <FiDownload className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search trip, owner, vessel, species, station…"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                  className="block w-full appearance-none rounded-2xl border border-slate-200 bg-white px-9 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="all">All statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-5 hidden overflow-hidden rounded-3xl border border-emerald-100 bg-white/75 backdrop-blur-xl shadow-sm md:block">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
          <div className="text-sm font-extrabold text-slate-900">Logs</div>
          <div className="text-xs font-semibold text-slate-500">
            Page <span className="text-slate-900">{safePage}</span> /{" "}
            <span className="text-slate-900">{totalPages}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/70 text-xs font-extrabold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3">Trip</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Vessel</th>
                <th className="px-5 py-3">Species</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Weight</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/70">
              {pageRows.map((r) => (
                <tr key={r.id} className="hover:bg-emerald-50/35">
                  <td className="px-5 py-4">
                    <div className="font-extrabold text-slate-900">{r.tripId}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <FiCalendar className="h-3.5 w-3.5" />
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">{r.ownerCode}</td>

                  <td className="px-5 py-4 text-slate-700">
                    <div className="flex items-center gap-2">
                      <FiAnchor className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">{r.vesselName}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <FiMapPin className="h-3.5 w-3.5" />
                      {r.station}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">{r.speciesName}</td>

                  <td className="px-5 py-4 font-extrabold text-slate-900">{r.qty}</td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {r.weightKg} kg
                  </td>

                  <td className="px-5 py-4">
                    <StatusPill status={r.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <IconBtn title="View">
                        <FiEye className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Edit">
                        <FiEdit2 className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Delete" danger>
                        <FiTrash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      {/* Mobile cards */}
      <div className="mt-5 space-y-3 md:hidden">
        {pageRows.map((r) => (
          <div
            key={r.id}
            className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/75 backdrop-blur-xl shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{r.tripId}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <StatusPill status={r.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Field label="Owner" value={r.ownerCode} />
                <Field label="Vessel" value={r.vesselName} />
                <Field label="Species" value={r.speciesName} />
                <Field label="Qty / Weight" value={`${r.qty} • ${r.weightKg}kg`} />
              </div>

              <div className="mt-3 text-xs text-slate-500">
                <span className="font-bold text-slate-700">Station:</span> {r.station}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <ActionBtn label="View" icon={<FiEye className="h-4 w-4" />} />
                <ActionBtn label="Edit" icon={<FiEdit2 className="h-4 w-4" />} />
                <ActionBtn
                  label="Delete"
                  icon={<FiTrash2 className="h-4 w-4" />}
                  danger
                />
              </div>
            </div>
          </div>
        ))}

        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/75 backdrop-blur-xl shadow-sm">
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, title, danger = false }) {
  return (
    <button
      type="button"
      title={title}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-white transition",
        danger
          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
          : "border-slate-200 text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ActionBtn({ label, icon, danger = false }) {
  return (
    <button
      type="button"
      className={[
        "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-extrabold transition",
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-900",
      ].join(" ")}
      style={!danger ? { borderColor: "rgba(34,229,166,0.35)" } : undefined}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200/70 px-5 py-4">
      <div className="text-xs font-semibold text-slate-500">
        Page <span className="text-slate-900">{page}</span> /{" "}
        <span className="text-slate-900">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
