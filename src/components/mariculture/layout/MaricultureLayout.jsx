// src/layouts/MaricultureLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import MaricultureSidebar from "../MaricultureSidebar";

export default function MaricultureLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Left sidebar */}
      <MaricultureSidebar />

      {/* Right content area */}
      <main className="flex-1 md:ml-64">
        {/* Optional top header bar */}
        <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur flex items-center px-4 justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Mariculture Console
            </h1>
            <p className="text-xs text-slate-500">
              Farms · Cultivation · Harvest management
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold">
              RV
            </span>
          </div>
        </header>

        {/* Page content (each route) */}
        <div className="p-4 md:p-6">
          {/* Child routes render here */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
