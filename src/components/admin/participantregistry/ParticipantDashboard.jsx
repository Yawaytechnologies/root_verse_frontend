// src/components/admin/participantRegistry/ParticipantRegistryDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FiUsers, FiShield, FiTruck, FiBox,
  FiClock, FiActivity, FiArrowRight,
  FiCheckCircle, FiAlertCircle, FiMapPin,
  FiPackage, FiUser,
} from "react-icons/fi";
import {
  MdOutlineStorefront, MdOutlineInventory2,
  MdLocalShipping,
} from "react-icons/md";
import { BsSnow2 } from "react-icons/bs";

/* ══════════════════════════════════════
   THEME
══════════════════════════════════════ */
const A = "#D97706";

/* ══════════════════════════════════════
   MOCK DATA
══════════════════════════════════════ */
const STATS = [
  { label: "Registered Participants", value: "248", sub: "PCCs, processors, transport, cold stores", icon: FiUsers,   accent: true  },
  { label: "Active PCCs",             value: "34",  sub: "Operational today",                       icon: FiShield,  accent: false },
  { label: "Transport Providers",     value: "58",  sub: "Verified fleet partners",                 icon: FiTruck,   accent: false },
  { label: "Cold Stores",             value: "19",  sub: "Storage capacity tracked",                icon: BsSnow2,   accent: false },
];

const RECENT = [
  { id:1, name:"Nagapattinam PCC — East Dock",    type:"PCC",        status:"Active",   time:"23/01/2026, 10:25", icon: MdOutlineStorefront },
  { id:2, name:"Blue Lantern Processing Unit",    type:"Processor",  status:"Pending",  time:"23/01/2026, 09:40", icon: FiPackage           },
  { id:3, name:"Chennai Cold Storage — Bay 2",    type:"Cold Store", status:"Active",   time:"22/01/2026, 18:12", icon: BsSnow2             },
  { id:4, name:"SeaPearl Logistics",              type:"Transport",  status:"Inactive", time:"22/01/2026, 14:05", icon: MdLocalShipping     },
  { id:5, name:"Cuddalore Fish Processors Ltd",  type:"Processor",  status:"Active",   time:"21/01/2026, 11:30", icon: FiPackage           },
];

const HEALTH = [
  { label:"Pending approvals",  value:"7",       icon: FiAlertCircle, tone:"amber" },
  { label:"Active entities",    value:"211",     icon: FiCheckCircle, tone:"green" },
  { label:"Sync status",        value:"Healthy", icon: FiActivity,    tone:"green" },
  { label:"Districts covered",  value:"14",      icon: FiMapPin,      tone:"slate" },
];

const MODULES = [
  { label:"Quality Checker",          to:"/admin/participant-registry/quality-checker",                icon: FiShield            },
  { label:"Crate Packer",             to:"/admin/participant-registry/crate-packer",                   icon: MdOutlineInventory2 },
  { label:"Transport Registration",   to:"/admin/participant-registry/transport-registration",         icon: FiTruck             },
  { label:"Operator Registration",    to:"/admin/participant-registry/center-operator-registeration",  icon: FiUser              },
  { label:"Collection Centre",        to:"/admin/participant-registry/collection-center-registration", icon: MdOutlineStorefront },
  { label:"Crate Assign & Transport", to:"/admin/participant-registry/transport-assign",               icon: FiBox               },
  { label:"Crate Receive Status",     to:"/admin/participant-registry/center-crate-status",            icon: FiActivity          },
];

/* ══════════════════════════════════════
   ATOMS
══════════════════════════════════════ */
function StatusBadge({ status }) {
  const map = {
    active:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending:  "bg-amber-50 text-amber-700 ring-amber-200",
    inactive: "bg-stone-100 text-stone-500 ring-stone-200",
  };
  const key = status?.toLowerCase() ?? "inactive";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 whitespace-nowrap ${map[key] ?? map.inactive}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${key === "active" ? "bg-emerald-500" : key === "pending" ? "bg-amber-500" : "bg-stone-400"}`} />
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ring-1 ${accent ? "text-white ring-amber-700/30" : "bg-white ring-stone-200"}`}
         style={accent ? { background: A, boxShadow: `0 8px 28px ${A}44` } : undefined}>
      {accent && <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accent ? "text-amber-100" : "text-stone-400"}`}>{label}</p>
          <p className={`mt-2.5 text-3xl font-bold leading-none ${accent ? "text-white" : "text-stone-900"}`}>{value}</p>
          <p className={`mt-1.5 text-xs leading-relaxed ${accent ? "text-amber-100" : "text-stone-500"}`}>{sub}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent ? "bg-white/20" : "bg-stone-100"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-white" : "text-stone-500"}`} />
        </div>
      </div>
    </div>
  );
}

function HealthRow({ label, value, icon: Icon, tone }) {
  const t = {
    amber: { bg:"bg-amber-50",   icon:"text-amber-600",  val:"text-amber-700"  },
    green: { bg:"bg-emerald-50", icon:"text-emerald-600",val:"text-emerald-700" },
    slate: { bg:"bg-stone-100",  icon:"text-stone-500",  val:"text-stone-700"  },
  }[tone] ?? { bg:"bg-stone-100", icon:"text-stone-500", val:"text-stone-700" };

  return (
    <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${t.icon}`} />
        </span>
        <p className="text-sm font-medium text-stone-700">{label}</p>
      </div>
      <p className={`text-sm font-bold ${t.val}`}>{value}</p>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export default function ParticipantRegistryDashboard() {
  return (
    <div className="pccDash min-h-full" style={{ background: "#F7F5F2" }}>
      <style>{`
        .pccDash * { box-sizing: border-box; }
        .pcc-module-card { transition: box-shadow 0.15s, transform 0.15s; }
        .pcc-module-card:hover { box-shadow: 0 6px 20px rgba(217,119,6,0.15); transform: translateY(-1px); }
        .pcc-quick-link { transition: background 0.15s, box-shadow 0.15s; }
        .pcc-quick-link:hover { background: #FEF3C7 !important; }
        .pcc-quick-link:hover .pcc-ql-icon { background: ${A}; color: white; }
        .pcc-ql-icon { transition: background 0.15s, color 0.15s; }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">

        {/* ═══ HERO ═══ */}
        <div className="relative overflow-hidden rounded-2xl ring-1 ring-amber-900/20 shadow-lg"
             style={{ background: "#1C1409" }}>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-25"
                 style={{ background: `radial-gradient(circle, ${A}, transparent 65%)` }} />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-15"
                 style={{ background: `radial-gradient(circle, ${A}, transparent 65%)` }} />
            {/* subtle dot grid */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)"/>
            </svg>
          </div>

          <div className="relative px-5 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                     style={{ background: `${A}22`, color: A, border: `1px solid ${A}44` }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: A }} />
                  Participant Registry · Dashboard
                </div>
                <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl tracking-tight leading-tight">
                  Participant Overview
                </h1>
                <p className="mt-1.5 text-sm text-white/45 max-w-md">
                  Manage PCCs, processors, transport partners and cold stores from one place
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <Link
                  to="/admin/participant-registry/quality-checker"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all active:scale-[0.97]"
                  style={{ background: A, boxShadow: `0 8px 20px ${A}44` }}
                >
                  Quality Checker <FiArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/admin/participant-registry/crate-packer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white/70 bg-white/8 ring-1 ring-white/15 hover:bg-white/15 hover:text-white transition-all"
                >
                  Crate Packer <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ STATS ═══ */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ═══ MIDDLE GRID ═══ */}
        <div className="grid gap-5 lg:grid-cols-12">

          {/* Recent registrations */}
          <div className="lg:col-span-7 rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div>
                <p className="font-semibold text-stone-800">Recent Registrations</p>
                <p className="text-xs text-stone-500 mt-0.5">Latest entities added to the registry</p>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                    style={{ background: A }}>
                {RECENT.length}
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {RECENT.map(r => {
                const Icon = r.icon;
                return (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50/60 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                         style={{ background: A }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-stone-800 truncate text-sm leading-tight">{r.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600">
                          {r.type}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-stone-400">
                          <FiClock className="h-3 w-3" />{r.time}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 bg-stone-50/60 px-5 py-3">
              <p className="text-xs text-stone-400">
                Showing <strong className="text-stone-700">{RECENT.length}</strong> recent entries
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-4">

            {/* Registry health */}
            <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
              <div className="border-b border-stone-100 px-5 py-4">
                <p className="font-semibold text-stone-800">Registry Health</p>
                <p className="text-xs text-stone-500 mt-0.5">Live status indicators</p>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                {HEALTH.map(h => <HealthRow key={h.label} {...h} />)}
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
              <div className="border-b border-stone-100 px-5 py-4">
                <p className="font-semibold text-stone-800">Quick Actions</p>
                <p className="text-xs text-stone-500 mt-0.5">Jump to any module</p>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                {MODULES.map(m => {
                  const Icon = m.icon;
                  return (
                    <Link key={m.label} to={m.to}
                          className="pcc-quick-link group flex items-center justify-between rounded-xl px-4 py-2.5 ring-1 ring-stone-200"
                          style={{ background: "#FAFAF9" }}>
                      <div className="flex items-center gap-3">
                        <span className="pcc-ql-icon flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">
                          {m.label}
                        </p>
                      </div>
                      <FiArrowRight className="h-4 w-4 text-stone-400 group-hover:translate-x-0.5 transition-transform"
                                    style={{ color: "inherit" }} />
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ═══ MODULE GRID ═══ */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">All Modules</p>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {MODULES.map(m => {
              const Icon = m.icon;
              return (
                <Link key={m.label} to={m.to}
                      className="pcc-module-card group flex flex-col items-center gap-3 rounded-2xl bg-white px-3 py-5 text-center ring-1 ring-stone-200">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition-colors group-hover:text-white"
                       style={{}}
                       onMouseEnter={e => e.currentTarget.style.background = A}
                       onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-semibold text-stone-600 group-hover:text-stone-900 leading-tight transition-colors">
                    {m.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}