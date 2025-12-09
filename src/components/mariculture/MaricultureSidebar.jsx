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

const sections = [
  {
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: FiGrid }],
  },
  {
    label: "Registry",
    items: [
      { id: "marine-farms", label: "Marine farms", icon: FiDatabase },
      { id: "units", label: "Cultivation units", icon: FiLayers },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "harvests", label: "Harvest batches", icon: FiDroplet },
      { id: "qr-crates", label: "Crate & QR tags", icon: FiHash },
      { id: "reports", label: "Reports", icon: FiFileText },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside
      className="
        hidden md:flex md:flex-col
        w-64
        bg-slate-950 border-r border-slate-800/80
        md:fixed md:inset-y-0 md:left-0
      "
    >
      {/* Brand */}
      <div className="px-4 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-xs font-bold text-slate-950 tracking-tight">
              RV
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
              RootVerse
            </span>
            <span className="text-sm font-semibold text-slate-50">
              Mariculture
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      className="group w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium transition border border-transparent text-slate-300 hover:text-emerald-200 hover:border-emerald-500/40 hover:bg-slate-900/70"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg border text-[13px] border-slate-700 bg-slate-900 text-slate-300 group-hover:border-emerald-400/70 group-hover:text-emerald-200">
                        <Icon />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800/80 text-[10px] text-slate-500">
        <p className="font-medium text-slate-400">Traceability mode</p>
        <p>Scope: Mariculture · Seaweed units only</p>
      </div>
    </aside>
  );
}
