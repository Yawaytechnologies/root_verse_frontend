import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FiBell,
  FiChevronLeft,
  FiHome,
  FiMenu,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

function TraderSidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-sm font-extrabold text-white">
            RV
          </div>

          <div>
            <h2 className="text-sm font-extrabold leading-4">RootVerse</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Aquaculture Panel
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <FiXCircle />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            Panel
          </p>

          <NavLink
            to="/admin/trader/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                isActive
                  ? "bg-slate-800 text-white shadow-[inset_4px_0_0_#06b6d4]"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            <FiHome className="text-base" />
            <span>Dashboard</span>
          </NavLink>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <Link
            to="/admin/hub"
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-extrabold text-white hover:bg-cyan-600"
          >
            <FiChevronLeft />
            Back to Registry Hub
          </Link>
        </div>
      </aside>
    </>
  );
}

function TraderTopbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
        >
          <FiMenu />
        </button>

        <div>
          <h1 className="text-lg font-extrabold text-slate-950">
            Trader Dashboard
          </h1>
          <p className="hidden text-xs font-semibold text-slate-500 sm:block">
            Dashboard / Trader Approval
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 sm:flex"
        >
          <FiShield />
        </button>

        <button
          type="button"
          className="relative h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <FiBell className="mx-auto" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-extrabold text-white">
          A
        </div>
      </div>
    </header>
  );
}

export default function TraderAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <TraderSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 lg:pl-64">
        <TraderTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}