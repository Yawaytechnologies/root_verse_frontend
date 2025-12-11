import { FiDroplet, FiActivity, FiTrendingUp, FiClock, FiLayers } from "react-icons/fi";

export default function AquaDashboard() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Aquaculture Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quick overview of farms, ponds and current culture cycles.
        </p>
      </div>

      {/* Top stat cards – only what matters */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={FiLayers}
          label="Registered farms"
          value="34"
          helper="Across all clusters"
        />
        <StatCard
          icon={FiDroplet}
          label="Active ponds"
          value="112"
          helper="Stocked this cycle"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Live biomass (MT)"
          value="386.4"
          helper="Estimated standing crop"
        />
      </div>

      {/* Main section: Current pond cycles */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              CURRENT POND CYCLES
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Key ponds being monitored this week.
            </p>
          </div>
          <span className="text-xs text-slate-400">Local time</span>
        </div>

        <div className="divide-y divide-slate-100">
          {PONDS.map((pond) => (
            <div
              key={pond.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left: identity */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-50">
                  <FiDroplet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {pond.farm} · {pond.pondCode}
                  </p>
                  <p className="text-xs text-slate-500">
                    {pond.location} · {pond.species}
                  </p>
                </div>
              </div>

              {/* Right: status */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 font-medium">
                  Day {pond.dayOfCycle} · {pond.stage}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <FiClock className="h-3 w-3" />
                  {pond.daysToHarvest} days to harvest
                </span>
                <span className="hidden sm:inline text-slate-500">
                  Biomass: {pond.biomass} MT (est.)
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* --- small pieces --- */

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
      </div>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  );
}

/* --- dummy data --- */

const PONDS = [
  {
    id: 1,
    farm: "NA-FRM-001 · Blue Creek",
    pondCode: "P01",
    location: "Nagapattinam",
    species: "Shrimp · L. vannamei",
    dayOfCycle: 42,
    stage: "Mid grow-out",
    daysToHarvest: 35,
    biomass: 18.4,
  },
  {
    id: 2,
    farm: "NA-FRM-004 · Sunrise Aquafarm",
    pondCode: "P07",
    location: "Tuticorin",
    species: "Tilapia",
    dayOfCycle: 65,
    stage: "Pre-harvest",
    daysToHarvest: 10,
    biomass: 22.1,
  },
  {
    id: 3,
    farm: "NA-FRM-009 · Green Fields",
    pondCode: "P03",
    location: "Mandapam",
    species: "Seabass",
    dayOfCycle: 15,
    stage: "Early grow-out",
    daysToHarvest: 70,
    biomass: 6.2,
  },
];
