// src/components/admin/wildcapture/WildCaptureDashboard.jsx
import { FiAnchor, FiActivity, FiMapPin, FiClock } from "react-icons/fi";

export default function WildCaptureDashboard() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Wild Capture Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quick overview of vessels, active trips and today&apos;s landings.
        </p>
      </div>

      {/* Top stat cards – only the main three */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={FiAnchor}
          label="Registered vessels"
          value="128"
          helper="Sea & inland"
        />
        <StatCard
          icon={FiActivity}
          label="Active trips"
          value="19"
          helper="On water now"
        />
        <StatCard
          icon={FiMapPin}
          label="Today’s landings (MT)"
          value="42.8"
          helper="Across 4 ports"
        />
      </div>

      {/* Main section: Today’s trips */}
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Today&apos;s trips
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Latest movements from registered vessels
            </p>
          </div>
          <span className="text-xs text-slate-400">Local time</span>
        </div>

        <div className="divide-y divide-slate-100">
          {TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-50">
                  <FiAnchor className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {trip.vessel}
                  </p>
                  <p className="text-xs text-slate-500">
                    {trip.departure} · ETA {trip.eta}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-slate-900/5 px-2 py-0.5 font-medium">
                  {trip.gear}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <FiClock className="h-3 w-3" />
                  {trip.hoursAtSea}h at sea
                </span>
                <span className="hidden sm:inline text-slate-500">
                  {trip.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* --- Small components --- */

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

/* --- Lightweight dummy data --- */

const TRIPS = [
  {
    id: 1,
    vessel: "RV-003 · Sea Pearl",
    gear: "Trawl",
    departure: "Departed Tuticorin · 03:20",
    eta: "19:45",
    status: "On fishing grounds",
    hoursAtSea: 12,
  },
  {
    id: 2,
    vessel: "RV-019 · Blue Lantern",
    gear: "Gillnet",
    departure: "Departed Nagapattinam · 05:10",
    eta: "21:30",
    status: "Returning to port",
    hoursAtSea: 9,
  },
  {
    id: 3,
    vessel: "RV-021 · Coral Dawn",
    gear: "Longline",
    departure: "Departed Mandapam · 01:40",
    eta: "17:10",
    status: "At harbour limits",
    hoursAtSea: 14,
  },
];
