// src/components/layout/AppLayout.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Trips", path: "/trips" },
  { label: "Catch Logs", path: "/catch-logs" },
  { label: "Crates", path: "/crates" },
  { label: "Vessel Registry", path: "/vessels" },
  { label: "PCC Ops", path: "/pcc-ops" },
  { label: "Processing Batches", path: "/processing-batches" },
  { label: "Certificates", path: "/certificates" },
  { label: "Settings", path: "/settings" },
];

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500" />
              <div>
                <p className="text-sm font-semibold">RootVerse</p>
                <p className="text-[11px] text-slate-500">
                  Wild Capture Console
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "block px-3 py-2 rounded-xl",
                    isActive
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
              <div className="flex items-center gap-2 lg:hidden">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500" />
                <div>
                  <p className="text-sm font-semibold">RootVerse</p>
                  <p className="text-[11px] text-slate-500">Wild Capture</p>
                </div>
              </div>
              <h1 className="text-sm sm:text-base font-semibold">
                Wild Capture – Dashboard
              </h1>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search trips, crates..."
                    className="bg-transparent text-xs outline-none placeholder:text-slate-400"
                  />
                </div>
                <button className="hidden sm:inline-flex items-center text-xs font-medium px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm">
                  Export
                </button>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200" />
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold">Landing QC</p>
                    <p className="text-[11px] text-slate-500">@inspector.rv</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 py-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
