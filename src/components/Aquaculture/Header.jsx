// src/components/Header.jsx
import React from "react";
import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  let title = "Aquaculture Dashboard";
  let subtitle = "Overview of ponds and daily logs";

  if (location.pathname === "/aquaculture/ponds") {
    title = "Pond List";
    subtitle = "View all ponds and their current status";
  } else if (location.pathname.startsWith("/aquaculture/ponds/")) {
    const pondId = location.pathname.split("/").pop();
    title = "Pond Details";
    subtitle = `Details for ${pondId}`;
  } else if (location.pathname === "/aquaculture/logs/feed") {
    title = "Feed Log";
    subtitle = "Record daily feed usage";
  } else if (location.pathname === "/aquaculture/logs/water") {
    title = "Water Quality Log";
    subtitle = "Record key water parameters";
  } else if (location.pathname === "/aquaculture/logs/health") {
    title = "Health / Mortality Log";
    subtitle = "Record mortalities, symptoms & treatments";
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-sky-50/90 backdrop-blur border-b border-sky-200 px-4 md:px-6 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-xs text-slate-600">{subtitle}</p>
        <p className="text-sm md:text-base font-semibold text-slate-900">
          {title}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-[11px] text-slate-500">Today</p>
          <p className="text-sm font-medium text-slate-900">09 Dec 2025</p>
        </div>
        <button className="relative h-9 w-9 rounded-full flex items-center justify-center text-sm text-slate-900 bg-sky-100 border border-sky-200">
          YS
        </button>
      </div>
    </header>
  );
}
