// src/components/admin/mariculture/MariCultureDashboard.jsx
import {
  FiAnchor,
  FiDroplet,
  FiTrendingUp,
  FiClock,
  FiMapPin,
} from "react-icons/fi";

export default function MariCultureDashboard() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Mariculture Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Snapshot of offshore sites, active cages and current sea cycles.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={FiMapPin}
          label="Registered sites"
          value="12"
          helper="Along current coastline"
        />
        <StatCard
          icon={FiAnchor}
          label="Active cages / lines"
          value="78"
          helper="Stocked this cycle"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Offshore biomass (MT)"
          value="154.3"
          helper="Estimated standing crop"
        />
      </div>

      {/* Main section: Current offshore units */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              ACTIVE OFFSHORE UNITS
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Key cages / longlines being monitored this week.
            </p>
          </div>
          <span className="text-xs text-slate-400">Local time</span>
        </div>

        <div className="divide-y divide-slate-100">
          {UNITS.map((unit) => (
            <div
              key={unit.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left: identity */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-50">
                  <FiDroplet className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {unit.site} · {unit.unitCode}
                  </p>
                  <p className="text-xs text-slate-500">
                    {unit.location} · {unit.species}
                  </p>
                </div>
              </div>

              {/* Right: status */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 font-medium">
                  {unit.structureType} · Day {unit.dayOfCycle}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <FiClock className="h-3 w-3" />
                  {unit.daysToHarvest} days to harvest
                </span>
                <span className="hidden sm:inline text-slate-500">
                  Biomass: {unit.biomass} MT (est.)
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

const UNITS = [
  {
    id: 1,
    site: "MC-SITE-001 · Coral Bay",
    unitCode: "CAGE-01",
    location: "Off Tuticorin, 3.2 km",
    species: "Seabass",
    structureType: "Cage",
    dayOfCycle: 70,
    daysToHarvest: 25,
    biomass: 12.7,
  },
  {
    id: 2,
    site: "MC-SITE-003 · Emerald Reef",
    unitCode: "LINE-A1",
    location: "Nagapattinam, 1.8 km",
    species: "Seaweed · Kappaphycus",
    structureType: "Longline",
    dayOfCycle: 35,
    daysToHarvest: 15,
    biomass: 6.4,
  },
  {
    id: 3,
    site: "MC-SITE-004 · Deep Blue",
    unitCode: "CAGE-05",
    location: "Mandapam, 4.5 km",
    species: "Cobia",
    structureType: "Cage",
    dayOfCycle: 20,
    daysToHarvest: 60,
    biomass: 4.9,
  },
];
