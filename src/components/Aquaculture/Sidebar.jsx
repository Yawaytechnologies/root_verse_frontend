// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiList,
  FiDroplet,
  FiActivity,
  FiPackage,
  FiBox,
  FiSearch,
} from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";

const logItems = [
  { label: "Feed Log", path: "/aquaculture/logs/feed", icon: FiLayers },
  {
    label: "Water Quality Log",
    path: "/aquaculture/logs/water",
    icon: FiDroplet,
  },
  {
    label: "Health / Mortality Log",
    path: "/aquaculture/logs/health",
    icon: FiActivity,
  },
];

export default function Sidebar() {
  const location = useLocation();

  const activeClass = "bg-sky-200 text-slate-900 border border-sky-400";
  const normalClass = "text-slate-900 hover:bg-sky-100";

  const qrActiveClass =
    "relative bg-[#143027] text-emerald-50 border border-[#1f463b] shadow-sm after:absolute after:right-3 after:top-2 after:bottom-2 after:w-[3px] after:rounded-full after:bg-emerald-300";

  const qrNormalClass =
    "text-slate-900 hover:bg-sky-100 border border-transparent";

  const isActive = (path, exact = true) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sky-50 border-r border-sky-200 text-slate-900 sticky top-0 h-screen shadow-sm">
      {/* Logo */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-slate-900 text-xl font-bold">
            RV
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">RootVerse</p>
            <p className="text-xs text-slate-500">Traceability Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 px-2 space-y-1 text-sm">
        {/* Overview */}
        <p className="px-2 text-[11px] uppercase tracking-wide text-slate-500">
          Overview
        </p>

        <Link
          to="/aquaculture/dashboard"
          className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
            isActive("/aquaculture/dashboard") ? activeClass : normalClass
          }`}
        >
          <FiGrid className="text-[15px]" />
          <span>Dashboard</span>
        </Link>

        {/* Ponds */}
        <p className="mt-3 px-2 text-[11px] uppercase tracking-wide text-slate-500">
          Ponds
        </p>

        <Link
          to="/aquaculture/ponds"
          className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
            isActive("/aquaculture/ponds", false) ? activeClass : normalClass
          }`}
        >
          <FiList className="text-[15px]" />
          <span>Pond List</span>
        </Link>

        {/* Daily Logs */}
        <p className="mt-3 px-2 text-[11px] uppercase tracking-wide text-slate-500">
          Daily Logs
        </p>

        {logItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
                active ? activeClass : normalClass
              }`}
            >
              <Icon className="text-[15px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Harvest */}
        <p className="mt-3 px-2 text-[11px] uppercase tracking-wide text-slate-500">
          Harvest
        </p>

        <Link
          to="/aquaculture/harvest-batches"
          className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
            isActive("/aquaculture/harvest-batches", false)
              ? activeClass
              : normalClass
          }`}
        >
          <FiPackage className="text-[15px]" />
          <span>Harvest Batches</span>
        </Link>

        <Link
          to="/aquaculture/crates"
          className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
            isActive("/aquaculture/crates", false) ? activeClass : normalClass
          }`}
        >
          <FiBox className="text-[15px]" />
          <span>Crate Assignments</span>
        </Link>

        <Link
          to="/aquaculture/crate-qr-generator"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition ${
            isActive("/aquaculture/crate-qr-generator", false)
              ? qrActiveClass
              : qrNormalClass
          }`}
        >
          <MdQrCodeScanner className="text-[18px]" />
          <span>Crate QR Generator</span>
        </Link>

        {/* Traceability */}
        <p className="mt-3 px-2 text-[11px] uppercase tracking-wide text-slate-500">
          Traceability
        </p>

        <Link
          to="/aquaculture/traceability"
          className={`flex items-center gap-2 rounded-md px-3 py-2 transition ${
            isActive("/aquaculture/traceability") ? activeClass : normalClass
          }`}
        >
          <FiSearch className="text-[15px]" />
          <span>Crate Lookup</span>
        </Link>
      </nav>
    </aside>
  );
}