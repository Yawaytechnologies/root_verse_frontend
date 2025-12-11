// src/components/mariculture/Sidebar.jsx
import React from "react";
import {
  FiGrid,
  FiDatabase,
  FiLayers,
  FiDroplet,
  FiHash,
  FiFileText,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

const sections = [
  {
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: FiGrid, to: "/mariculture" }],
  },
  {
    label: "Registry",
    items: [
      {
        id: "marine-farms",
        label: "Marine farms",
        icon: FiDatabase,
        to: "/mariculture/farms",
      },
      {
        id: "units",
        label: "Cultivation units",
        icon: FiLayers,
        to: "/mariculture/units",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        id: "harvests",
        label: "Harvest batches",
        icon: FiDroplet,
        to: "/mariculture/harvests",
      },
      {
        id: "qr-crates",
        label: "Crate & QR tags",
        icon: FiHash,
        to: "/mariculture/qr-crates",
      },
      {
        id: "reports",
        label: "Reports",
        icon: FiFileText,
        to: "/mariculture/reports",
      },
    ],
  },
];

// Flatten for mobile bottom nav (pick main ones)
const mobileItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FiGrid,
    to: "/mariculture",
  },
  {
    id: "farms",
    label: "Farms",
    icon: FiDatabase,
    to: "/mariculture/farms",
  },
  {
    id: "units",
    label: "Units",
    icon: FiLayers,
    to: "/mariculture/units",
  },
  {
    id: "harvests",
    label: "Harvests",
    icon: FiDroplet,
    to: "/mariculture/harvests",
  },
];

export default function Sidebar() {
  return (
    <>
      {/* Desktop / Tablet sidebar */}
      <aside
        className="
          hidden md:flex md:flex-col
          w-64
          bg-white/95
          border-r border-slate-200
          shadow-sm
          md:fixed md:inset-y-0 md:left-0
        "
      >
        {/* Brand */}
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-emerald-400 to-teal-500 text-xs font-bold tracking-tight text-white shadow-md shadow-sky-200/70">
              RV
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                RootVerse
              </span>
              <span className="text-sm font-semibold text-slate-900">
                Mariculture
              </span>
              <span className="mt-1 inline-flex w-fit rounded-full bg-sky-50 px-2.5 py-[2px] text-[10px] font-medium text-sky-700 border border-sky-100">
                Traceability · Seaweed
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto no-scrollbar px-3 py-4 bg-slate-50/80">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                {section.label}
              </p>
              <ul className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={item.to}
                        end={item.to === "/mariculture"}
                        className="block"
                      >
                        {({ isActive }) => (
                          <div
                            className={`
                              group flex w-full items-center gap-2.5
                              rounded-xl px-2.5 py-2 text-xs font-medium
                              border transition-all duration-150
                              ${
                                isActive
                                  ? "border-sky-400 bg-sky-50 text-sky-800 shadow-[0_0_0_1px_rgba(56,189,248,0.2)]"
                                  : "border-transparent bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200"
                              }
                            `}
                          >
                            <span
                              className={`
                                inline-flex h-7 w-7 items-center justify-center
                                rounded-lg border text-[13px] bg-slate-50
                                transition-all duration-150
                                ${
                                  isActive
                                    ? "border-sky-300 bg-sky-50 text-sky-600"
                                    : "border-slate-200 text-slate-500 group-hover:border-sky-300 group-hover:bg-sky-50 group-hover:text-sky-600"
                                }
                              `}
                            >
                              <Icon />
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 px-4 py-3 text-[11px] bg-white/95">
          <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
            <p className="font-medium text-slate-800">Traceability mode</p>
            <p className="text-[10px] text-slate-500">
              Scope: Mariculture · Seaweed units only
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="
          fixed bottom-0 inset-x-0 z-40
          flex items-stretch justify-around
          bg-white/95 border-t border-slate-200
          shadow-[0_-4px_12px_rgba(15,23,42,0.08)]
          md:hidden
        "
      >
        {mobileItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === "/mariculture"}
              className="flex-1"
            >
              {({ isActive }) => (
                <button
                  type="button"
                  className={`
                    w-full flex flex-col items-center justify-center gap-0.5
                    py-2.5 text-[10px] font-medium
                    transition-all duration-150
                    ${
                      isActive
                        ? "text-sky-700"
                        : "text-slate-500 hover:text-slate-800"
                    }
                  `}
                >
                  <span
                    className={`
                      inline-flex h-8 w-8 items-center justify-center
                      rounded-full border text-[14px]
                      ${
                        isActive
                          ? "border-sky-400 bg-sky-50 shadow-sm"
                          : "border-slate-200 bg-slate-50"
                      }
                    `}
                  >
                    <Icon />
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
