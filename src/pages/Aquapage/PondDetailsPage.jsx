// src/pages/Aquapage/PondDetailsPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiInfo,
  FiDroplet,
  FiActivity,
  FiClock,
  FiLayers,
  FiThermometer,
  FiAlertTriangle,
  FiPackage,
} from "react-icons/fi";

// Dummy master data for ponds
const POND_DATA = {
  "RV-POND-01": {
    id: "RV-POND-01",
    name: "Pond A",
    species: "Vannamei",
    waterType: "Brackish",
    area: "0.8 acres",
    depth: "1.5 m",
    farmId: "RV-FARM-TH-001045",
    doc: 12,
    stockingDensity: "110 PL/m²",
    // 🆕 Stocking info (dummy for now)
    stockingDate: "2025-09-10",
    seedSource: "BlueWave Hatchery Pvt Ltd",
    seedBatch: "BW-PL10-0925-A",
    plCount: 850000,
    stage: "PL10",
    lastSampling: {
      date: "2025-12-07",
      doc: 10,
      avgWeight: "1.2 g",
      biomassEstimate: "0.9 T",
    },
  },
  "RV-POND-02": {
    id: "RV-POND-02",
    name: "Pond B",
    species: "Black Tiger",
    waterType: "Brackish",
    area: "1.0 acres",
    depth: "1.4 m",
    farmId: "RV-FARM-TH-001045",
    doc: 48,
    stockingDensity: "25 PL/m²",
    // 🆕 Stocking info
    stockingDate: "2025-08-20",
    seedSource: "Oceanic Hatchery",
    seedBatch: "OC-BT-PL12-0820",
    plCount: 320000,
    stage: "PL12",
    lastSampling: {
      date: "2025-12-05",
      doc: 45,
      avgWeight: "12.5 g",
      biomassEstimate: "3.1 T",
    },
  },
  "RV-POND-03": {
    id: "RV-POND-03",
    name: "Pond C",
    species: "Tilapia",
    waterType: "Freshwater",
    area: "0.7 acres",
    depth: "1.2 m",
    farmId: "RV-FARM-TH-001045",
    doc: 72,
    stockingDensity: "6 fish/m²",
    // 🆕 Stocking info
    stockingDate: "2025-07-30",
    seedSource: "GreenLake Hatchery",
    seedBatch: "GL-TIL-0730",
    plCount: 42000,
    stage: "Fingerlings",
    lastSampling: {
      date: "2025-12-04",
      doc: 70,
      avgWeight: "420 g",
      biomassEstimate: "2.4 T",
    },
  },
  "RV-POND-04": {
    id: "RV-POND-04",
    name: "Pond D",
    species: "Vannamei",
    waterType: "Brackish",
    area: "1.1 acres",
    depth: "1.6 m",
    farmId: "RV-FARM-TH-001045",
    doc: 96,
    stockingDensity: "105 PL/m²",
    // 🆕 Stocking info
    stockingDate: "2025-08-05",
    seedSource: "BlueWave Hatchery Pvt Ltd",
    seedBatch: "BW-PL15-0805-D",
    plCount: 900000,
    stage: "PL15",
    lastSampling: {
      date: "2025-12-03",
      doc: 93,
      avgWeight: "21.8 g",
      biomassEstimate: "4.0 T",
    },
  },
  "RV-POND-05": {
    id: "RV-POND-05",
    name: "Pond E",
    species: "Vannamei",
    waterType: "Brackish",
    area: "0.6 acres",
    depth: "1.4 m",
    farmId: "RV-FARM-TH-001045",
    doc: 5,
    stockingDensity: "120 PL/m²",
    // 🆕 Stocking info
    stockingDate: "2025-12-03",
    seedSource: "Coastal Seed Hatchery",
    seedBatch: "CS-PL8-1203-E",
    plCount: 600000,
    stage: "PL8",
    lastSampling: {
      date: "2025-12-08",
      doc: 4,
      avgWeight: "0.3 g",
      biomassEstimate: "0.3 T",
    },
  },
  "RV-POND-06": {
    id: "RV-POND-06",
    name: "Pond F",
    species: "Black Tiger",
    waterType: "Brackish",
    area: "1.3 acres",
    depth: "1.5 m",
    farmId: "RV-FARM-TH-001045",
    doc: 88,
    stockingDensity: "20 PL/m²",
    // 🆕 Stocking info
    stockingDate: "2025-08-10",
    seedSource: "Oceanic Hatchery",
    seedBatch: "OC-BT-PL15-0810-F",
    plCount: 280000,
    stage: "PL15",
    lastSampling: {
      date: "2025-12-06",
      doc: 85,
      avgWeight: "19.2 g",
      biomassEstimate: "3.7 T",
    },
  },
};

// Dummy timelines (kept generic)
const waterHistory = [
  {
    date: "2025-12-09",
    time: "07:30",
    temp: "28.4°C",
    ph: "7.8",
    do: "5.9 mg/L",
    salinity: "14.5 ppt",
  },
  {
    date: "2025-12-08",
    time: "07:35",
    temp: "28.1°C",
    ph: "7.7",
    do: "5.8 mg/L",
    salinity: "15.0 ppt",
  },
  {
    date: "2025-12-07",
    time: "07:40",
    temp: "27.9°C",
    ph: "7.6",
    do: "5.7 mg/L",
    salinity: "14.8 ppt",
  },
];

const feedHistory = [
  { date: "2025-12-09", time: "08:30", feedType: "CP 35%", qty: "18.5 kg" },
  { date: "2025-12-08", time: "14:15", feedType: "CP 35%", qty: "16.0 kg" },
  {
    date: "2025-12-08",
    time: "08:20",
    feedType: "Nursery crumble",
    qty: "9.0 kg",
  },
];

const healthEvents = [
  {
    date: "2025-12-07",
    mortality: 42,
    symptom: "Reduced feeding, surface swimming",
    treatment: "Vitamin C + probiotic in feed × 3 days",
  },
  {
    date: "2025-12-03",
    mortality: 15,
    symptom: "Mild gill discolouration",
    treatment: "Water exchange + zeolite",
  },
];

export default function PondDetailsPage() {
  const { pondId } = useParams();
  const navigate = useNavigate();

  const pond = POND_DATA[pondId] || {
    id: pondId,
    name: "Unknown Pond",
    species: "-",
    waterType: "-",
    area: "-",
    depth: "-",
    farmId: "RV-FARM-TH-001045",
    doc: "-",
    stockingDensity: "-",
    // 🆕 fallback stocking fields so UI doesn’t break
    stockingDate: "-",
    seedSource: "-",
    seedBatch: "-",
    plCount: null,
    stage: "-",
    lastSampling: {
      date: "-",
      doc: "-",
      avgWeight: "-",
      biomassEstimate: "-",
    },
  };

  const cardShell =
    "rounded-2xl border border-sky-100 bg-white p-4 shadow-md";

  return (
    <div className="space-y-6 bg-sky-50/60 rounded-2xl p-4 md:p-5 text-slate-900">
      {/* Pond Profile */}
      <section className={cardShell}>
        <div className="flex items-center gap-2 mb-3">
          <FiInfo className="text-sky-600 text-base" />
          <h2 className="text-sm font-semibold text-slate-900">
            Pond Profile
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-slate-600">Pond ID</p>
            <p className="text-slate-900 font-medium">{pond.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Pond Name</p>
            <p className="text-slate-900 font-medium">{pond.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Species</p>
            <p className="text-slate-900 flex items-center gap-1">
              <FiDroplet className="text-sky-600 text-[14px]" />
              <span>{pond.species}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Water Type</p>
            <p className="text-slate-900">{pond.waterType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Area</p>
            <p className="text-slate-900">{pond.area}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Depth</p>
            <p className="text-slate-900">{pond.depth}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Farm ID</p>
            <p className="text-slate-900">{pond.farmId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">DOC (Days of Culture)</p>
            <p className="text-slate-900">{pond.doc}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Stocking Density</p>
            <p className="text-slate-900">{pond.stockingDensity}</p>
          </div>
        </div>
      </section>

      {/* 🆕 Stocking Information */}
      <section className={cardShell}>
        <div className="flex items-center gap-2 mb-3">
          <FiPackage className="text-sky-600 text-base" />
          <h2 className="text-sm font-semibold text-slate-900">
            Stocking Information
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-slate-600">Stocking Date</p>
            <p className="text-slate-900 font-medium">
              {pond.stockingDate || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-600">Seed Source / Hatchery</p>
            <p className="text-slate-900 font-medium">
              {pond.seedSource || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-600">Seed Batch No</p>
            <p className="text-slate-900 font-medium">
              {pond.seedBatch || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-600">PL / Seed Count</p>
            <p className="text-slate-900 font-medium">
              {pond.plCount ? pond.plCount.toLocaleString() : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-600">Stage / Size at Stocking</p>
            <p className="text-slate-900 font-medium">
              {pond.stage || pond.species || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-600">DOC at Stocking</p>
            <p className="text-slate-900 font-medium">0</p>
          </div>
        </div>
      </section>

      {/* Stocking / Biomass Snapshot */}
      <section className={cardShell}>
        <div className="flex items-center gap-2 mb-3">
          <FiLayers className="text-sky-600 text-base" />
          <h2 className="text-sm font-semibold text-slate-900">
            Stocking & Biomass Snapshot
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2">
            <p className="text-xs text-slate-600">Last Sampling Date</p>
            <p className="text-slate-900 font-medium">
              {pond.lastSampling.date}
            </p>
          </div>
          <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2">
            <p className="text-xs text-slate-600">DOC at Sampling</p>
            <p className="text-slate-900 font-medium">
              {pond.lastSampling.doc}
            </p>
          </div>
          <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2">
            <p className="text-xs text-slate-600">Avg Weight</p>
            <p className="text-slate-900 font-medium">
              {pond.lastSampling.avgWeight}
            </p>
          </div>
          <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2">
            <p className="text-xs text-slate-600">Biomass Estimate</p>
            <p className="text-slate-900 font-medium">
              {pond.lastSampling.biomassEstimate}
            </p>
          </div>
          <div className="rounded-lg bg-sky-50 border border-sky-100 px-3 py-2 md:col-span-2">
            <p className="text-xs text-slate-600">Note</p>
            <p className="text-xs text-slate-700">
              Sampling data will be used for harvest planning and export
              traceability events (GDST / GS1).
            </p>
          </div>
        </div>
      </section>

      {/* Water Quality Timeline */}
      <section className={cardShell}>
        <div className="flex items-center gap-2 mb-3">
          <FiThermometer className="text-sky-600 text-base" />
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Water Quality (Last 3 Days)
          </h2>
        </div>
        <div className="space-y-2 text-sm">
          {waterHistory.map((entry) => (
            <div
              key={`${entry.date}-${entry.time}`}
              className="grid md:grid-cols-5 gap-2 rounded-lg bg-sky-50 px-3 py-2 border border-sky-100"
            >
              <div>
                <p className="text-xs text-slate-600">Date</p>
                <p className="text-slate-900">
                  {entry.date} · {entry.time}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Temp</p>
                <p className="text-slate-900">{entry.temp}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">pH</p>
                <p className="text-slate-900">{entry.ph}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">DO</p>
                <p className="text-slate-900">{entry.do}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Salinity</p>
                <p className="text-slate-900">{entry.salinity}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feed & Health */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Feed History */}
        <div className={cardShell}>
          <div className="flex items-center gap-2 mb-3">
            <FiDroplet className="text-sky-600 text-base" />
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Feed Logs
            </h2>
          </div>
          <ul className="space-y-2 text-sm">
            {feedHistory.map((log, idx) => (
              <li
                key={idx}
                className="rounded-lg bg-sky-50 px-3 py-2 border border-sky-100 flex justify-between gap-3"
              >
                <div>
                  <p className="text-slate-900">
                    {log.date} · {log.time}
                  </p>
                  <p className="text-xs text-slate-700">
                    {log.feedType} – {log.qty}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Health History */}
        <div className={cardShell}>
          <div className="flex items-center gap-2 mb-3">
            <FiActivity className="text-emerald-600 text-base" />
            <h2 className="text-sm font-semibold text-slate-900">
              Health & Mortality Events
            </h2>
          </div>
          <ul className="space-y-2 text-sm">
            {healthEvents.map((event, idx) => (
              <li
                key={idx}
                className="flex gap-2 rounded-lg bg-amber-50/60 px-3 py-2 border border-amber-100"
              >
                <FiAlertTriangle className="mt-[2px] text-amber-600 text-sm" />
                <div>
                  <p className="text-slate-900">
                    {event.date} – Mortality:{" "}
                    <span className="font-semibold">
                      {event.mortality}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-700">
                    Symptoms: {event.symptom}
                  </p>
                  <p className="text-[11px] text-slate-700">
                    Treatment: {event.treatment}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={cardShell}>
        <div className="flex items-center gap-2 mb-3">
          <FiClock className="text-sky-600 text-base" />
          <h2 className="text-sm font-semibold text-slate-900">
            Quick Actions
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <button
            onClick={() => navigate("/aquaculture/logs/feed")}
            className="inline-flex items-center gap-1 rounded-md border border-sky-400 px-3 py-2 text-sky-800 hover:bg-sky-100"
          >
            <FiLayers className="text-[14px]" />
            <span>Add Feed Log</span>
          </button>
          <button
            onClick={() => navigate("/aquaculture/logs/water")}
            className="inline-flex items-center gap-1 rounded-md border border-cyan-400 px-3 py-2 text-cyan-800 hover:bg-cyan-50"
          >
            <FiDroplet className="text-[14px]" />
            <span>Add Water Quality</span>
          </button>
          <button
            onClick={() => navigate("/aquaculture/logs/health")}
            className="inline-flex items-center gap-1 rounded-md border border-emerald-400 px-3 py-2 text-emerald-800 hover:bg-emerald-50"
          >
            <FiActivity className="text-[14px]" />
            <span>Add Health / Mortality</span>
          </button>
          {/* Create harvest batch pre-filled with this pond */}
          <button
            onClick={() =>
              navigate(
                `/aquaculture/harvest-batches/new?pondId=${encodeURIComponent(
                  pond.id
                )}`
              )
            }
            className="inline-flex items-center gap-1 rounded-md border border-violet-400 px-3 py-2 text-violet-800 hover:bg-violet-50"
          >
            <FiPackage className="text-[14px]" />
            <span>Create Harvest Batch</span>
          </button>
        </div>
      </section>
    </div>
  );
}
